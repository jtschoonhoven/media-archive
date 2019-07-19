const csvParse = require('csv-parse');
const s3Service = require('./s3');

/**
 * Apply metadata from a CSV that has been uploaded to S3.
 */
module.exports.handleUpload = async (s3Url) => {
    // this might need s3.getPresignedUrl(s3Url);
    const csvStream = s3Service.streamObject(s3Url);
    const parsedCsv = await parseCsvStream(csvStream);
    console.log(parsedCsv);
};


/**
 * Parse a stringified CSV document into an array of objects keyed by column name.
 */
async function parseCsvStream(csvStream) {
    const result = []; // array of objects keyed by column name
    const parser = csvParse({ columns: true });

    // pipe the CSV document to the parser and return a promise for the parsed result
    csvStream.pipe(parser);
    return new Promise((resolve, reject) => {
        parser.on('readable', () => {
            let record = parser.read();
            while (record) {
                result.push(record);
                record = parser.read();
            }
        });
        parser.on('error', (error) => {
            reject(error.message);
        });
        parser.on('end', () => {
            parser.end();
            resolve(result);
        });
    });
}
