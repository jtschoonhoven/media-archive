exports.up = async (db) => {
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
            media_name TEXT UNIQUE, -- ("Title") name of media
            media_description TEXT, -- describes content of media
            media_authors TEXT, -- comma-separated list of authors, photographers, creators, etc
            media_notes TEXT, -- (AKA "Add. Notes" or "Notes (word by word, on back, post it notes, attached to paperwork)")
            media_transcript TEXT, -- transcript (usually auto-generated via OCR)
            media_date TIMESTAMP, -- (AKA "Date" or "Year") date the media was created
            media_tags TEXT, -- (AKA "Key Words") additional comma-separated keywords for search
            media_type TEXT, -- normalized media types ('audio', 'video', 'image', 'document')

            -- media file info
            media_file_extension TEXT, -- upper-case file extension, e.g. MP4, PDF, etc
            media_file_name TEXT, -- original name of uploaded file
            media_file_path TEXT, -- e.g. "/board/meetings/november.txt" path to the uploaded media at time of upload
            media_file_size_bytes INTEGER, -- size of object on S3

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
            deleted_at TIMESTAMP
        );
    `);

    await db.run(`
        CREATE FUNCTION ts_vectorize_v0 (
            media_name TEXT,
            media_tags TEXT,
            media_description TEXT,
            media_authors TEXT,
            audio_lecturers TEXT,
            image_photographer TEXT,
            media_notes TEXT,
            media_transcript TEXT,
            box_name TEXT,
            folder_name TEXT,
            series_name TEXT,
            series_description TEXT,
            media_type TEXT,
            media_file_extension TEXT,
            media_file_name TEXT,
            media_file_path TEXT,
            origin_location TEXT,
            origin_medium TEXT,
            origin_medium_notes TEXT
        )
            RETURNS tsvector
        AS
        $BODY$
            SELECT
                   SETWEIGHT(TO_TSVECTOR('english', COALESCE($1,  '')), 'A')
                || SETWEIGHT(TO_TSVECTOR('simple',  COALESCE($2,  '')), 'A')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($3,  '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('simple',  COALESCE($4,  '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('simple',  COALESCE($5,  '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('simple',  COALESCE($6,  '')), 'B')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($7,  '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($8,  '')), 'C')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($9,  '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($10, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($11, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($12, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($13, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($14, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($15, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($16, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($17, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($18, '')), 'D')
                || SETWEIGHT(TO_TSVECTOR('english', COALESCE($19, '')), 'D');
        $BODY$
        LANGUAGE sql
        IMMUTABLE;
    `);

    await db.run(`
        CREATE FUNCTION ts_relevance_v0 (
            tsvector TSVECTOR,
            query_lex TSQUERY,
            query_pre TSQUERY
        )
            RETURNS integer
        AS
        $BODY$
            SELECT (
                ( TS_RANK(tsvector, query_lex) * 3
                + TS_RANK(tsvector, query_pre)) * 100 / 4
            )::integer
        $BODY$
        LANGUAGE sql
        IMMUTABLE;
    `);

    await db.run(`
        CREATE INDEX idx_tsvector ON media
        USING GIN(
            TS_VECTORIZE_V0(
                media_name,
                media_tags,
                media_description,
                media_authors,
                audio_lecturers,
                image_photographer,
                media_notes,
                media_transcript,
                box_name,
                folder_name,
                series_name,
                series_description,
                media_type,
                media_file_extension,
                media_file_name,
                media_file_path,
                origin_location,
                origin_medium,
                origin_medium_notes
            )
        );
    `);
};

exports.down = async (db) => {
    await db.run('DROP INDEX IF EXISTS idx_tsvector;');
    await db.run('DROP FUNCTION IF EXISTS ts_relevance_v0');
    await db.run('DROP FUNCTION IF EXISTS ts_vectorize_v0');
    await db.run('DROP TABLE IF EXISTS media;');
};
