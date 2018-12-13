const config = require('config');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const logger = require('./logger');
const settings = require('../settings');

const MIGRATIONS_PATH = path.resolve(__dirname, '../migrations');
const RDS_CONFIG = {
    user: config.get('RDS_USERNAME'),
    host: config.get('RDS_HOSTNAME'),
    database: config.get('RDS_DB_NAME'),
    password: config.get('RDS_PASSWORD'),
    port: config.get('RDS_PORT'),
};


class Database {
    constructor() {
        logger.info('connecting to database');
        this.pool = new Pool(RDS_CONFIG);
    }

    /*
     * Fetch a single row as an object, or undefined if no rows were returned.
     */
    async get(sql) {
        return this.all(sql).then((rows) => { // eslint-disable-line arrow-body-style
            return rows.length ? rows[0] : undefined;
        });
    }

    /*
     * Fetch a all rows as an array of objects.
     */
    async all(sql) {
        const client = await this.pool.connect();
        try {
            return await client.query(sql).then(res => res.rows);
        }
        finally {
            client.release();
        }
    }

    /*
     * Execute a single query and return the database object (chainable).
     */
    async run(sql) {
        return this.all(sql).then(() => this);
    }

    /*
     * Load a single migration file from MIGRATIONS_PATH as a module.
     */
    _loadMigration(filename) {
        const filepath = path.resolve(MIGRATIONS_PATH, filename);
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require(filepath);
    }

    /*
     * Apply a migration file by calling its "up" method.
     */
    async up(filename, { force }) {
        logger.warn(`applying migration ${filename}`);
        if (settings.NODE_ENV !== 'development' && !force) {
            throw new Error('applying migrations forbidden outside development');
        }
        try {
            await this._loadMigration(filename).up(this);
            logger.info(`applied migration ${filename} successfully`);
        }
        catch (err) {
            logger.error(`\
                failed to apply migration ${filename}: "${err.toString()}"\n${err.trace}\
            `);
            throw err;
        }
    }

    /*
     * Revert a migration file by calling its "down" method.
     */
    async down(filename, { force }) {
        logger.warn(`reverting migration ${filename}`);
        if (settings.NODE_ENV !== 'development' && !force) {
            throw new Error('reverting migrations forbidden outside development');
        }
        try {
            await this._loadMigration(filename).down(this);
            logger.info(`reverted migration ${filename} successfully`);
        }
        catch (err) {
            logger.error(`\
                failed to revert migration ${filename}: "${err.toString()}"\n${err.trace}\
            `);
            throw err;
        }
    }

    /*
     * Revert all migration files in MIGRATIONS_PATH and re-apply them in order.
     */
    async rebuild({ force }) {
        // FIXME: migrations should be tracked in a database
        logger.warn('reverting and re-applying all migrations');
        const filenames = await fs.readdir(MIGRATIONS_PATH);
        // revert migrations in reverse order
        filenames.sort().reverse();
        for (const filename of filenames) { // eslint-disable-line no-restricted-syntax
            await this.down(filename, { force }) // eslint-disable-line no-await-in-loop
                .catch(logger.error);
        }
        // re-apply migrations in order
        filenames.reverse();
        for (const filename of filenames) { // eslint-disable-line no-restricted-syntax
            await this.up(filename, { force }) // eslint-disable-line no-await-in-loop
                .catch(logger.error);
        }
        logger.info('migrations complete');
    }
}

const db = new Database();


class Transaction {
    constructor() {
        this.queries = []; // stores a promise for each active/completed query
        this.client = db.pool.connect();
        this._begin();
    }

    /*
     * Open a transaction and return the client instance.
     * This is called in the constructor and should not be used elsewhere.
     */
    async _begin() {
        try {
            await this.client;
            const query = this.client.query('BEGIN;');
            this.queries.push(query);
        }
        catch (err) {
            logger.error(`failed to open transaction: ${err.toString()}`);
            if (this.client) {
                this.client.release();
            }
            throw err;
        }
    }

    /*
     * Run a query within this transaction.
     */
    async add(sql, rollbackOnFailure = true) {
        await this.client;
        try {
            const query = this.client.query(sql);
            this.queries.push(query);
            return this.client;
        }
        catch (err) {
            logger.error(`failed to add query to transaction: ${err.toString()}`);
            if (rollbackOnFailure) {
                await this.rollback();
            }
            throw err;
        }
    }

    /*
     * Undo all commands within this transaction.
     */
    async rollback() {
        logger.warn(`rolling back transaction with ${this.queries.length} statements`);
        await this.client;
        try {
            await this.client.query('ROLLBACK;');
        }
        catch (err) {
            logger.error(`Failed to roll back transaction: ${err.toString()}`);
            throw err;
        }
        finally {
            this.client.release();
        }
        return this.client;
    }

    /*
     * Close and commit an open transaction.
     * NOTE: the same client *MUST* be used to make queries within the transaction.
     */
    async commit(rollbackOnFailure = true) {
        await this.client;
        try {
            const query = this.client.query('COMMIT;');
            this.queries.push(query);
            await Promise.all(this.queries);
            this.client.release();
        }
        catch (err) {
            logger.error(`failed to commit transaction: ${err.toString()}`);
            if (rollbackOnFailure) {
                await this.rollback();
            }
            throw err;
        }
    }
}


module.exports = db;
module.exports.Transaction = Transaction;
