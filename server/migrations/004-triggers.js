exports.up = async (db) => {
    /*
     * MEDIA_FILE_PATH_TO_ARRAY_TRIGGER: automatically generates an array from media_file_path.
     */
    await db.run(`
        CREATE TRIGGER trigger_01_media_file_path_to_array
        BEFORE INSERT OR UPDATE ON media
        FOR EACH ROW EXECUTE PROCEDURE media_file_path_to_array_v0();
    `);

    /*
     * MEDIA_TO_TSVECTOR_TRIGGER: automatically create a search-optimized tsvector.
     */
    await db.run(`
        CREATE TRIGGER trigger_02_media_to_tsvector
        BEFORE INSERT OR UPDATE ON media
        FOR EACH ROW EXECUTE PROCEDURE media_to_tsvector_v0();
    `);
};

exports.down = async (db) => {
    await db.run('DROP TRIGGER IF EXISTS trigger_01_media_file_path_to_array ON media CASCADE');
    await db.run('DROP TRIGGER IF EXISTS trigger_02_media_to_tsvector ON media CASCADE');
};
