const path = require('path');
const sqlite = require('sqlite'); // eslint-disable-line import/no-extraneous-dependencies
const { Pool } = require('pg');

const MIGRATIONS_PATH = path.resolve(__dirname, '../migrations');
const MIGRATION_FORCE_VALUE = 'last';


class SqliteDatabase {
    constructor() {
        this.connection = sqlite.open(':memory:');
    }

    // fetch a single row as an object
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

    // execute all SQL files in the ../migrations directory in order
    async migrate(replayLast = false) {
        const force = replayLast ? MIGRATION_FORCE_VALUE : true;
        const db = await this.connection;
        return db.migrate({ force, migrationsPath: MIGRATIONS_PATH });
    }

    // wait for queries to complete then close connection
    async close() {
        const db = await this.connection;
        return db.close();
    }
}

class PostgresDatabase {
    constructor() {
        this.pool = new Pool();
    }

    async get(sql) {
        return this.pool.query(sql);
    }
}


module.exports = new SqliteDatabase();
