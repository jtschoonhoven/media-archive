exports.up = async (db) => {
    /*
     * IDX_MEDIA_TYPE: optimize search on media.media_type.
     */
    await db.run('CREATE INDEX idx_media_type ON media (media_type);');

    /*
     * IDX_TSVECTOR: optimized search on lexemes.
     */
    await db.run('CREATE INDEX idx_tsvector ON media USING GIN(media_tsvector);');
};

exports.down = async (db) => {
    await db.run('DROP INDEX IF EXISTS idx_tsvector;');
    await db.run('DROP INDEX IF EXISTS idx_media_type;');
};
