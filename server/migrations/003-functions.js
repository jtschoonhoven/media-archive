exports.up = async (db) => {
    /*
     * CREATED_AT: sets `created_at` to the current timestamp.
     */
    await db.run(`
        CREATE FUNCTION created_at_v0 ()
        RETURNS TRIGGER AS $created_at_trigger$
        BEGIN
            NEW.created_at = NOW();
            RETURN NEW;
        END;
        $created_at_trigger$ LANGUAGE plpgsql;
    `);

    /*
     * UPDATED_AT: sets `created_at` to the current timestamp.
     */
    await db.run(`
        CREATE FUNCTION updated_at_v0 ()
        RETURNS TRIGGER AS $updated_at_trigger$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $updated_at_trigger$ LANGUAGE plpgsql;
    `);

    /*
     * TS_RELEVANCE: generates relavance scores for media against the given tsqueries.
     */
    await db.run(`
        CREATE FUNCTION ts_relevance_v0 (
            tsvector TSVECTOR,
            query_lex TSQUERY, -- "lex" matches word roots (more precise)
            query_pre TSQUERY  -- "pre" mathes word prefixes (less precise)
        )
        RETURNS integer
        AS
        $BODY$
            SELECT (
                ( TS_RANK(tsvector, query_lex) * 3 -- multiplier is relative weight of "lex" match
                + TS_RANK(tsvector, query_pre)) * 100 / 4
            )::integer
        $BODY$
        LANGUAGE sql
        IMMUTABLE;
    `);

    /*
     * MEDIA_TO_TSVECTOR: creates a search-optimized tsvector from text columns on the media table.
     */
    await db.run(`
        CREATE FUNCTION media_to_tsvector_v0 ()
        RETURNS trigger AS $media_tsvector_trigger$
        BEGIN
            NEW.media_tsvector = (
                   SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_name,            '')), 'A')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_tags,            '')), 'A')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_description,     '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_authors,         '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_file_path,       '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.media_file_path_array, ' ', '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.audio_lecturers,       '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.image_photographer,    '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_notes,           '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_transcript,      '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.box_name,              '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.folder_name,           '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.series_name,           '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.series_description,    '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_file_extension,  '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.media_file_name,       '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.origin_location,       '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.origin_medium,         '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.origin_medium_notes,   '')), 'D')
            );
            RETURN NEW;
        END;
        $media_tsvector_trigger$ LANGUAGE plpgsql;
    `);

    /*
     * MEDIA_FILE_PATH_TO_ARRAY: automatically generates an array from media_file_path.
     */
    await db.run(`
        CREATE FUNCTION media_file_path_to_array_v0 ()
        RETURNS trigger AS $media_file_path_array_trigger$
        BEGIN
            IF NEW.media_file_path IS NULL THEN
                RAISE EXCEPTION 'media.media_file_path cannot be null';
            END IF;
            IF NEW.media_file_name IS NULL THEN
                RAISE EXCEPTION 'media.media_file_name cannot be null';
            END IF;
            NEW.media_file_path_array = STRING_TO_ARRAY(
                REPLACE(NEW.media_file_path, '\\', '/'), '/');
            RETURN NEW;
        END;
        $media_file_path_array_trigger$ LANGUAGE plpgsql;
    `);
};

exports.down = async (db) => {
    await db.run('DROP FUNCTION IF EXISTS media_file_path_to_array_v0');
    await db.run('DROP FUNCTION IF EXISTS media_to_tsvector_v0');
    await db.run('DROP FUNCTION IF EXISTS ts_relevance_v0');
    await db.run('DROP FUNCTION IF EXISTS updated_at_v0');
    await db.run('DROP FUNCTION IF EXISTS created_at_v0');
};
