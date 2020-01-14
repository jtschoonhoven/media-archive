const config = require('config');
const logger = require('../services/logger');
const sql = require('sql-template-strings');

const db = require('../services/database');

const TABLE_NAME_MEDIA = 'media';
const COL_NAME_TRANS_METHOD = 'media_transcription_method';
const COL_TYPE_TRANS_METHOD = 'TEXT';
const COL_NAME_TRANS_SUCCESS = 'media_transcription_method_success';
const COL_TYPE_TRANS_SUCCESS = 'BOOLEAN';


async function run() {
    const errors = [];
    try {
        await _addColIfNotExists(TABLE_NAME_MEDIA, COL_NAME_TRANS_METHOD, COL_TYPE_TRANS_METHOD);
    }
    catch (err) {
        logger.error(err);
    }
    try {
        await _addColIfNotExists(TABLE_NAME_MEDIA, COL_NAME_TRANS_SUCCESS, COL_TYPE_TRANS_SUCCESS);
    }
    catch (err) {
        logger.error(err);
    }
}
module.exports = { run };


async function _addColIfNotExists(tableName, colName, colType) {
    try {
        const exists = await _columnExists(tableName, colName);
        if (!exists) {
            logger.info(`Adding column "${ colName }" to table "${ tableName }"`);
            await _addColumn(tableName, colName, colType);
            logger.info(`Successfully added column "${ colName }" to table "${ tableName }"`);
        }
    }
    catch (err) {
        throw new Error(`Failed to add column "${ colName }" to table "${ tableName }":\n${ err.message }`);
    }
}


async function _columnExists(tableName, colName) {
    const query = sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${ tableName }
        AND column_name = ${ colName };
    `;
    return db.getValue(query).then(colName => !!colName);
}


async function _addColumn(tableName, colName, colType) {
    const query = `ALTER TABLE ${ tableName } ADD COLUMN ${ colName } ${ colType };`;
    return db.raw(query);
}
