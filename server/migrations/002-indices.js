exports.up = async (db) => {
    /*
     * IDX_MEDIA_TYPE: optimize search on media.media_type.
     */
    await db.run('CREATE INDEX idx_media_type ON media (media_type);');

    /*
     * IDX_MEDIA_FILE_PATH: optimize queries on complete path to media file.
     */
    await db.run('CREATE INDEX idx_media_file_path ON media (media_file_path);');

    /*
     * IDX_TSVECTOR: optimized search on lexemes.
     */
    await db.run('CREATE INDEX idx_tsvector ON media USING GIN(media_tsvector);');

    /*
     * IDX_MEDIA_FILE_PATH_ARRAY: to support searching the filesystem.
     */
    await db.run('CREATE INDEX idx_media_file_path_array on media USING GIN (media_file_path_array);');

    /*
     * IDX_MEDIA_FILE_PATH_ARRAY_FIRST: the first non-root dir in the filesystem.
     */
    await db.run('CREATE INDEX idx_media_file_path_array_first on media ((media_file_path_array[1]));');

    /*
     * IDX_MEDIA_FILE_PATH_ARRAY_SECOND: the second-level dir (or filename) in the filesystem.
     */
    await db.run('CREATE INDEX idx_media_file_path_array_second on media ((media_file_path_array[2]));');
};

exports.down = async (db) => {
    await db.run('DROP INDEX IF EXISTS idx_media_file_path_array_second;');
    await db.run('DROP INDEX IF EXISTS idx_media_file_path_array_first;');
    await db.run('DROP INDEX IF EXISTS idx_media_file_path_array;');
    await db.run('DROP INDEX IF EXISTS idx_tsvector;');
    await db.run('DROP INDEX IF EXISTS idx_media_file_path;');
    await db.run('DROP INDEX IF EXISTS idx_media_type;');
};
