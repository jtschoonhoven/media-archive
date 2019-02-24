exports.up = async (db) => {
    /*
     * MEDIA: the primary directory of all media stored in the archive.
     */
    await db.run(`
        CREATE TABLE media (
            -- identifiers
            id SERIAL PRIMARY KEY, -- sequential primary ID
            uuid TEXT UNIQUE, -- client-facing, obscured ID, primarily for use with S3

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
            media_file_name TEXT, -- filename with extension, but without directory path
            media_file_name_unsafe TEXT, -- original, unsanitized file name as it appeared on the uploader's computer
            media_file_path TEXT, -- e.g. "/board/meetings/november.txt" path to the uploaded media at time of upload
            media_file_path_array TEXT[], -- same as media_file_path but split on path delimeters
            media_file_extension TEXT, -- upper-case file extension, e.g. MP4, PDF, etc
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

            -- upload workflow
            upload_status TEXT,
            upload_email TEXT,
            upload_batch_id TEXT,
            upload_started_at TIMESTAMP,
            upload_finished_at TIMESTAMP,

            -- metadata
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            deleted_at TIMESTAMP,

            -- search
            media_tsvector TSVECTOR
        );
    `);
};

exports.down = async (db) => {
    await db.run('DROP TABLE IF EXISTS media;');
};
