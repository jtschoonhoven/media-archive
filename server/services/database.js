const path = require('path');
const sqlite = require('sqlite'); // eslint-disable-line import/no-extraneous-dependencies

const MIGRATIONS_PATH = path.resolve(__dirname, '../migrations');
const MIGRATION_FORCE_VALUE = 'last';


class Database {
    constructor() {
        this.connection = sqlite.open(':memory:');
    }

    async get(sql) {
        const db = await this.connection;
        return db.get(sql);
    }

    async all(sql) {
        const db = await this.connection;
        return db.all(sql);
    }

    async execute(sql) {
        const db = await this.connection;
        return db.run(sql);
    }

    async migrate(replayLast = false) {
        const force = replayLast ? MIGRATION_FORCE_VALUE : true;
        const db = await this.connection;
        return db.migrate({ force, migrationsPath: MIGRATIONS_PATH });
    }
}


module.exports = new Database();
