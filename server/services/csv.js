const config = require('config');
const csvParse = require('csv-parse');
const streamTransform = require('stream-transform');
const sql = require('sql-template-strings');

const db = require('./database');
const s3Service = require('./s3');

const CSV_EDITABLE_COLUMN_WHITELIST = config.get('CONSTANTS.CSV_EDITABLE_COLUMN_WHITELIST');

/**
 * Parse media metadata from a CSV that has been uploaded to S3, then save it to the DB.
 */
module.exports.handleUpload = async (s3Url) => {
    // manage all queries inside a transaction so that we rollback if any fail
    const transaction = new db.Transaction();

    // get a ReadableStream for the CSV text
    const csvStream = s3Service.streamObject(s3Url);

    // get a writable stream that will transform rows of the CSV text into JSON objects
    const csvParser = csvParse({ columns: true });

    // get a writable stream that will apply updates from each row to the database
    const dbStreamLoader = getDatabaseStreamLoader(transaction);

    // streams leak memory if you don't call end() or destroy() after
    // manage the streams inside a promise so we can reject/resolve on error/success
    const promise = new Promise((resolve, reject) => {
        // destroy the parent stream on error and reject
        csvStream.on('error', (error) => {
            csvStream.destroy();
            reject(error.message);
        });

        // destroy the parent streams on error and reject
        csvParser.on('error', (error) => {
            csvParser.destroy();
            csvStream.destroy();
            reject(error.message);
        });

        // destroy the parent streams on error and reject
        dbStreamLoader.on('error', (error) => {
            dbStreamLoader.destroy();
            csvParser.destroy();
            csvStream.destroy();
            reject(error.message);
        });

        // close the parent streams and commit the transaction on complete
        dbStreamLoader.on('finish', () => {
            dbStreamLoader.end();
            csvParser.end();
            csvStream.end();
            transaction.commit()
                .then(() => resolve())
                .catch(err => reject(err)); // transactions automatically roll back on error
        });
    });

    csvStream.pipe(csvParser).pipe(dbStreamLoader);
    return promise;
};

function getDatabaseStreamLoader(transaction) {
    return streamTransform((row) => {
        // ensure required fields are present in row
        if (!row.id || !row.uuid) {
            throw new Error('CSVs must include their original "id" and "uuid" columns.');
        }

        // build the UPDATE query with a SET statement for each column in row
        const query = sql`UPDATE media SET `;
        Object.entries(row)
            // remove values that contain only whitespace
            .filter(([colname, value]) => value.trim()) // eslint-disable-line
            .forEach(([colname, value], idx) => {
                // ensure the passed-in column name is whitelisted for editing
                if (CSV_EDITABLE_COLUMN_WHITELIST.indexOf(colname) === -1) {
                    if (['id', 'uuid'].indexOf(colname) === -1) {
                        throw new Error(`Editing column ${colname} via CSV is forbidden.`);
                    }
                }
                // prepend a comma if this is not the first statement in the query
                if (idx) {
                    query.append(sql`, `);
                }
                query.append(`${colname} = `).append(sql`${value}`);
            });

        // finish the query and execute it within the transaction
        query.append(sql` WHERE id = ${row.id} AND uuid = ${row.uuid};`);
        transaction.add(query);
    });
}
