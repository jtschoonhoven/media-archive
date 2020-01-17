const sql = require('sql-template-strings');
const logger = require('../services/logger');

const db = require('../services/database');

const TABLE_NAME_MEDIA = 'media';
const COL_NAME = 'media_file_size_bytes';
const COL_TYPE = 'bigint';


async function run() {
    try {
        await _safeUpdateColType(TABLE_NAME_MEDIA, COL_NAME, COL_TYPE);
    }
    catch (err) {
        logger.error(err);
    }
}
module.exports = { run };


async function _safeUpdateColType(tableName, colName, colType) {
    logger.info('table update worker starting new run');
    try {
        const hasType = await _columnHasType(tableName, colName, colType);
        if (!hasType) {
            logger.info(`Updating column "${ colName }" to type "${ colType }"`);
            await _updateColumnType(tableName, colName, colType);
            logger.info(`table update worker finished: updated "${ colName }" to type "${ colType }"`);
        }
        else {
            logger.info('table update worker finished: no updates');
        }
    }
    catch (err) {
        err.message = `Failed to update column "${ colName }" to type "${ colType }":\n${ err.message }`;
        throw err;
    }
}


async function _columnHasType(tableName, colName, colType) {
    const query = sql`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = ${ tableName }
        AND column_name = ${ colName };
    `;
    return db.getValue(query).then(type => type === colType);
}


async function _updateColumnType(tableName, colName, colType) {
    const query = `
        ALTER TABLE ${ tableName }
        ALTER COLUMN ${ colName } TYPE ${ colType };
    `;
    return db.getValue(query);
}


// async function _addColIfNotExists(tableName, colName, colType) {
//     try {
//         const exists = await _columnExists(tableName, colName);
//         if (!exists) {
//             logger.info(`Adding column "${ colName }" to table "${ tableName }"`);
//             await _addColumn(tableName, colName, colType);
//             logger.info(`Successfully added column "${ colName }" to table "${ tableName }"`);
//         }
//     }
//     catch (err) {
//         err.message =`Failed to add "${ colName }" to table "${ tableName }":\n${ err.message }`;
//         throw err;
//     }
// }


// async function _columnExists(tableName, colName) {
//     const query = sql`
//         SELECT column_name
//         FROM information_schema.columns
//         WHERE table_name = ${ tableName }
//         AND column_name = ${ colName };
//     `;
//     return db.getValue(query).then(name => !!name);
// }


// async function _addColumn(tableName, colName, colType) {
//     const query = `ALTER TABLE ${ tableName } ADD COLUMN ${ colName } ${ colType };`;
//     return db.exec(query);
// }
