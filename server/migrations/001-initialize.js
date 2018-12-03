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
            media_name TEXT, -- ("Title") name of media (MUST be unique)
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
        INSERT INTO media (id, box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
            1, -- id
            1, -- box_id
            '2017', -- box_name
            'B', -- box_or_cabinet
            1, -- folder_id
            'monkey business', -- folder_name
            'the real deal', -- series_name
            null, -- series_description
            1, -- series_index_id
            'Scientists Baffled by Tiny Monkey', -- media_name
            'Hot chicken vegan kale chips live-edge. Cloud bread helvetica tumeric bitters PBR&B portland iceland bushwick enamel pin. Hot chicken farm-to-table poke, +1 food truck banjo taxidermy subway tile readymade man bun chartreuse helvetica. Squid fashion axe organic whatever kinfolk salvia. Plaid tofu literally, tacos stumptown bicycle rights cold-pressed microdosing. Beard echo park poke bespoke af, truffaut gluten-free. Before they sold out gentrify ramps small batch shabby chic whatever truffaut pork belly.', -- media_description
            'Gob Bluth, Buster Bluth', -- media_authors
            'cassette is sticky', -- media_notes
            null, -- media_transcript
            null, -- media_date
            'nofilter', -- media_tags
            'image', -- media_type
            'PNG', -- media_file_extension
            'scientists_baffled.png', -- media_file_name
            'uploads/scientists_baffled.png', -- media_file_path
            256, -- media_file_size_bytes
            'https://i.imgur.com/ynpG7gW.png', -- media_url
            'https://i.imgur.com/ynpG7gW.png', -- media_url_thumbnail
            null, -- origin_location
            null, -- origin_medium
            null, -- origin_medium_notes
            null, -- audio_lecturers
            null, -- audio_video_length_seconds
            'imgur', -- image_photographer
            'C', -- image_color
            'Location unknown', -- image_location_or_people_unknown
            null, -- image_professional_or_personal
            null, -- legal_is_confidential
            FALSE, -- legal_can_license
            null, -- workflow_batch_date
            null, -- workflow_error
            null, -- workflow_log
            null, -- workflow_status
            null, -- upload_started_at
            null, -- upload_success_at
            null, -- upload_failure_at
            null, -- processing_started_at
            null, -- processing_success_at
            null, -- processing_failure_at
            current_timestamp, -- created_at
            null, -- updated_at
            null  -- deleted_at
        );
    `);

    await db.run(`
        INSERT INTO media (id, box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
            2, -- id
            2, -- box_id
            '2017', -- box_name
            'B', -- box_or_cabinet
            2, -- folder_id
            'monkey party', -- folder_name
            'the real deal', -- series_name
            null, -- series_description
            2, -- series_index_id
            'Shocking New Research on Tiny Monkey', -- media_name
            'PBR&B portland iceland bushwick enamel pin. Hot chicken vegan kale chips live-edge. Cloud bread helvetica tumeric bitters. Hot chicken farm-to-table poke, +1 food truck banjo taxidermy subway tile readymade man bun chartreuse helvetica. Squid fashion axe organic whatever kinfolk salvia. Plaid tofu literally, tacos stumptown bicycle rights cold-pressed microdosing. Beard echo park poke bespoke af, truffaut gluten-free. Before they sold out gentrify ramps small batch shabby chic whatever truffaut pork belly.', -- media_description
            'Lucille Bluth', -- media_authors
            'cassette is blue', -- media_notes
            null, -- media_transcript
            null, -- media_date
            'longHairDontCare', -- media_tags
            'image', -- media_type
            'JPG', -- media_file_extension
            'new_research.png', -- media_file_name
            'uploads/new_research.png', -- media_file_path
            256, -- media_file_size_bytes
            'https://i.imgur.com/sDiIEYU.jpg', -- media_url
            'https://i.imgur.com/sDiIEYU.jpg', -- media_url_thumbnail
            null, -- origin_location
            null, -- origin_medium
            null, -- origin_medium_notes
            null, -- audio_lecturers
            null, -- audio_video_length_seconds
            'imgur', -- image_photographer
            'C', -- image_color
            'Person unknown', -- image_location_or_people_unknown
            null, -- image_professional_or_personal
            null, -- legal_is_confidential
            FALSE, -- legal_can_license
            null, -- workflow_batch_date
            null, -- workflow_error
            null, -- workflow_log
            null, -- workflow_status
            null, -- upload_started_at
            null, -- upload_success_at
            null, -- upload_failure_at
            null, -- processing_started_at
            null, -- processing_success_at
            null, -- processing_failure_at
            current_timestamp, -- created_at
            null, -- updated_at
            null  -- deleted_at
        );
    `);
};

exports.down = async db => db.run('DROP TABLE media;');
