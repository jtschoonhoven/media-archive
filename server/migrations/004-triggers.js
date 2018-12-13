exports.up = async (db) => {
    /*
     * CREATED_AT_TRIGGER: automatically set created_at on insert
     */
    await db.run(`
        CREATE TRIGGER trigger_01_created_at
        BEFORE INSERT ON media
        FOR EACH ROW EXECUTE PROCEDURE created_at_v0();
    `);

    /*
     * UPDATED_AT_TRIGGER: automatically set updated_at on update
     */
    await db.run(`
        CREATE TRIGGER trigger_02_updated_at
        BEFORE UPDATE ON media
        FOR EACH ROW EXECUTE PROCEDURE updated_at_v0();
    `);

    /*
     * MEDIA_FILE_PATH_TO_ARRAY_TRIGGER: automatically generates an array from media_file_path.
     */
    await db.run(`
        CREATE TRIGGER trigger_03_media_file_path_to_array
        BEFORE INSERT OR UPDATE ON media
        FOR EACH ROW EXECUTE PROCEDURE media_file_path_to_array_v0();
    `);

    /*
     * MEDIA_TO_TSVECTOR_TRIGGER: automatically create a search-optimized tsvector.
     */
    await db.run(`
        CREATE TRIGGER trigger_04_media_to_tsvector
        BEFORE INSERT OR UPDATE ON media
        FOR EACH ROW EXECUTE PROCEDURE media_to_tsvector_v0();
    `);
};

exports.down = async (db) => {
    await db.run('DROP TRIGGER IF EXISTS trigger_04_media_to_tsvector ON media CASCADE');
    await db.run('DROP TRIGGER IF EXISTS trigger_03_media_file_path_to_array ON media CASCADE');
    await db.run('DROP TRIGGER IF EXISTS trigger_02_updated_at ON media CASCADE');
    await db.run('DROP TRIGGER IF EXISTS trigger_01_created_at ON media CASCADE');
};
