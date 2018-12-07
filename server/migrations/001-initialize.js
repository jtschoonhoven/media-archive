exports.up = async (db) => {
    /*
     * MEDIA: the primary directory of all media stored in the archive.
     */
    await db.run(`
        CREATE TABLE media (
            id SERIAL PRIMARY KEY,

            -- group info
            box_id INTEGER, -- (AKA "Unique Shipping Box") numeric ID that identifies the shipping box
            box_name TEXT, -- (AKA "Box Name" or "Box Title") the (usually-but-not-always) unique ID of the shipping box
            box_or_cabinet TEXT, -- (AKA "Box (B) or Cabinet Folder (C)") enum of 'B' or 'C'
            folder_id INTEGER, -- (AKA "New Folder #") numeric ID that identifies the folder within a shipping box
            folder_name TEXT, -- (AKA "Old Folder # / Title") title or description of folder within a shipping box
            series_name TEXT, -- label used to group separate pieces of media that record the same event
            series_description TEXT, -- (AKA "Series" or "Series  (1/5, 2/5, etc.)") e.g. "Tape 1/1" NOT unique or likely to be useful
            series_index_id INTEGER, -- the order an item should appear in a series

            -- media info
            media_name TEXT, -- ("Title") name of media
            media_description TEXT, -- describes content of media
            media_authors TEXT, -- comma-separated list of authors, photographers, creators, etc
            media_notes TEXT, -- (AKA "Add. Notes" or "Notes (word by word, on back, post it notes, attached to paperwork)")
            media_transcript TEXT, -- transcript (usually auto-generated via OCR)
            media_date TIMESTAMP, -- (AKA "Date" or "Year") date the media was created
            media_tags TEXT, -- (AKA "Key Words") additional comma-separated keywords for search
            media_type TEXT, -- normalized media types ('audio', 'video', 'image', 'document')

            -- media file info
            media_file_name TEXT, -- original name of uploaded file
            media_file_path TEXT UNIQUE, -- e.g. "/board/meetings/november.txt" path to the uploaded media at time of upload
            media_file_path_array TEXT[], -- same as media_file_path but split on path delimeters
            media_file_extension TEXT, -- upper-case file extension, e.g. MP4, PDF, etc
            media_file_size_bytes INTEGER, -- size of object on S3t s

            -- media source info
            media_url TEXT, -- path to file location on S3
            media_url_thumbnail TEXT, -- path to file thumbnail on S3

            -- media origin info
            origin_location TEXT, -- (AKA "Location") place media was recorded or created
            origin_medium TEXT, -- (AKA "Type", "Format") e.g. "cassette", how the media was originally stored
            origin_medium_notes TEXT, -- (AKA "Document") e.g. "Cassette has 'Part I' written in black"

            -- type-specific info
            audio_lecturers TEXT, -- (AKA "Lecturer") name of speaker(s), in the case of audio
            audio_video_length_seconds INTEGER, -- audio or video duration
            image_photographer TEXT, -- (AKA "Photo Credit")
            image_color TEXT, -- (AKA "Black and White (BW) or Color (C)") enum of 'BW' and 'C'
            image_location_or_people_unknown TEXT, -- (AKA "Unknown People or Unknown Location")
            image_professional_or_personal TEXT, -- (AKA "Professional or Personal") enum of 'Personal' and 'Professional'

            -- legal info
            legal_is_confidential BOOLEAN, -- (AKA "Confidential (Board Meetings, Phone Calls, Specified Oral History Interviews)")
            legal_can_license BOOLEAN, -- (AKA "Licensing Rights (Y or N or ?)")

            -- workflow
            workflow_batch_date TIMESTAMP, -- time group of files was uploaded
            workflow_error TEXT,
            workflow_log TEXT,
            workflow_status TEXT, -- enum of ('upload_pending', 'upload_started', 'upload_success', 'upload_failure', 'worker_pending', 'worker_started', 'worker_success', 'worker_failure')

            -- workflow timers
            upload_started_at TIMESTAMP,
            upload_success_at TIMESTAMP,
            upload_failure_at TIMESTAMP,
            processing_started_at TIMESTAMP,
            processing_success_at TIMESTAMP,
            processing_failure_at TIMESTAMP,

            -- metadata
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            deleted_at TIMESTAMP,

            -- search
            media_tsvector TSVECTOR
        );
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
                REPLACE(NEW.media_file_path, '\\', '/'),
                NEW.media_file_name
            );
            RETURN NEW;
        END;
        $media_file_path_array_trigger$ LANGUAGE plpgsql;
    `);

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
    await db.run('DROP TRIGGER IF EXISTS trigger_01_media_file_path_to_array ON media CASCADE');
    await db.run('DROP TRIGGER IF EXISTS trigger_02_media_to_tsvector ON media CASCADE');
    await db.run('DROP FUNCTION IF EXISTS media_file_path_to_array_v0');
    await db.run('DROP FUNCTION IF EXISTS media_to_tsvector_v0');
    await db.run('DROP FUNCTION IF EXISTS ts_relevance_v0');
    await db.run('DROP TABLE IF EXISTS media;');
};
