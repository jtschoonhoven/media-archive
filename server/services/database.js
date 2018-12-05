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
     * Wait for clients to return to the pool then close connection.
     */
    async close() {
        return this.pool.close();
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
            logger.error(`failed to apply migration ${filename}: ${err.message}`);
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
            logger.error(`failed to revert migration ${filename}: ${err.message}`);
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
                .catch(() => 'no-op');
        }
        // re-apply migrations in order
        filenames.reverse();
        for (const filename of filenames) { // eslint-disable-line no-restricted-syntax
            await this.up(filename, { force }) // eslint-disable-line no-await-in-loop
                .catch(() => 'no-op');
        }
        logger.info('migrations complete');
    }
}


module.exports = new Database();
