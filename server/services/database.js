const config = require('config');
const fs = require('fs').promises;
const path = require('path');
const sqlite = require('sqlite'); // eslint-disable-line import/no-extraneous-dependencies
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


class BaseDatabase {
    _loadMigration(filename) {
        const filepath = path.resolve(MIGRATIONS_PATH, filename);
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require(filepath);
    }

    async up(filename) {
        logger.warn(`applying migration ${filename}`);
        try {
            return this._loadMigration(filename).up(this);
        }
        catch (err) {
            logger.error(`error while applying migration ${filename}: ${err.message}`);
            throw err;
        }
    }

    async down(filename) {
        logger.warn(`reverting migration ${filename}`);
        if (settings.NODE_ENV !== 'development') {
            throw new Error('reverting migrations forbidden outside development');
        }
        try {
            return this._loadMigration(filename).down(this);
        }
        catch (err) {
            logger.error(`error while reverting migration ${filename}: ${err.message}`);
            throw err;
        }
    }

    async rebuild() {
        logger.warn('reverting and re-applying all migrations');
        const filenames = await fs.readdir(MIGRATIONS_PATH);
        // revert migrations in reverse order
        filenames.sort().reverse();
        await filenames.forEach(async (filename) => {
            await this.down(filename).catch(() => {});
        });
        // re-apply migrations in order
        await filenames.reverse().forEach(async (filename) => {
            await this.up(filename).catch();
        });
    }
}


class SqliteDatabase extends BaseDatabase {
    constructor() {
        super();
        logger.info('connecting to sqlite3 database');
        this.connection = sqlite.open(':memory:');
    }

    // fetch a single row as an object or undefined
    async get(sql) {
        const db = await this.connection;
        return db.get(sql);
    }

    // fetch multiple rows as an array of objects
    async all(sql) {
        const db = await this.connection;
        return db.all(sql);
    }

    // execute a single query and return the database object
    async run(sql) {
        const db = await this.connection;
        return db.run(sql);
    }

    // wait for queries to complete then close connection
    async close() {
        const db = await this.connection;
        return db.close();
    }
}


class PostgresDatabase extends BaseDatabase {
    constructor() {
        super();
        logger.info('connecting to postgres database');
        this.pool = new Pool(RDS_CONFIG);
    }

    // fetch a single row as an object or undefined
    async get(sql) {
        return this.all(sql).then((rows) => { // eslint-disable-line arrow-body-style
            return rows.length ? rows[0] : undefined;
        });
    }

    // fetch a single row as an object or undefined
    async all(sql) {
        const client = await this.pool.connect();
        return client.query(sql).then(res => res.rows);
    }

    // execute a single query and return the database object
    async run(sql) {
        return this.all(sql).then(() => this.pool);
    }

    // wait for queries to complete then close connection
    async close() {
        return this.pool.close();
    }
}


if (settings.NODE_ENV === 'development') {
    module.exports = new SqliteDatabase();
}
else {
    module.exports = new PostgresDatabase();
}
