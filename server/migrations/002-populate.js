exports.up = async (db) => {
    for (let i = 0; i < 100; i += 1) { // eslint-disable-next-line no-await-in-loop
        await db.run(`
            INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
            VALUES (
                ${i}, -- box_id
                '2018', -- box_name
                'B', -- box_or_cabinet
                ${i}, -- folder_id
                'magazine clippings', -- folder_name
                null, -- series_name
                null, -- series_description
                null, -- series_index_id
                'Minutes from meeting ${i}', -- media_name
                'Read on for more great info from meeting ${i}', -- media_description
                '${i} authors', -- media_authors
                null, -- media_notes
                null, -- media_transcript
                null, -- media_date
                'tag-${i}', -- media_tags
                'document', -- media_type
                'PDF', -- media_file_extension
                '${i}.pdf', -- media_file_name
                'uploads/${i}.pdf', -- media_file_path
                ${i}, -- media_file_size_bytes
                'https://i.imgur.com/fqRBCko.jpg', -- media_url
                'https://i.imgur.com/fqRBCko.jpg', -- media_url_thumbnail
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
    }

    await db.run(`
        INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
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
        INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
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

    await db.run(`
        INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
            3, -- box_id
            '2018', -- box_name
            'B', -- box_or_cabinet
            3, -- folder_id
            'magazine clippings', -- folder_name
            null, -- series_name
            null, -- series_description
            null, -- series_index_id
            'Lifestyle: Defending Your Home Against Super-Intelligent Apes', -- media_name
            'Ten ways to protect your family this holiday season.', -- media_description
            'Maeby Funke', -- media_authors
            null, -- media_notes
            null, -- media_transcript
            null, -- media_date
            'safety, lifestyle, advice', -- media_tags
            'document', -- media_type
            'PDF', -- media_file_extension
            'safety.pdf', -- media_file_name
            'uploads/safety.pdf', -- media_file_path
            256, -- media_file_size_bytes
            'https://i.imgur.com/xYbJwhM.jpg', -- media_url
            'https://i.imgur.com/xYbJwhM.jpg', -- media_url_thumbnail
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

    await db.run(`
        INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
            3, -- box_id
            '2018', -- box_name
            'B', -- box_or_cabinet
            3, -- folder_id
            'magazine clippings', -- folder_name
            null, -- series_name
            null, -- series_description
            null, -- series_index_id
            'Editorial: Bonobos Should Be Ashamed of Themselves', -- media_name
            'More surprising facts about bonobos lack of moral direction.', -- media_description
            'Tobias Funke', -- media_authors
            null, -- media_notes
            null, -- media_transcript
            null, -- media_date
            'morality, shame', -- media_tags
            'document', -- media_type
            'PDF', -- media_file_extension
            'shame.pdf', -- media_file_name
            'uploads/shame.pdf', -- media_file_path
            256, -- media_file_size_bytes
            'https://i.imgur.com/UecRQCU.png', -- media_url
            'https://i.imgur.com/UecRQCU.png', -- media_url_thumbnail
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

    await db.run(`
        INSERT INTO media (box_id, box_name, box_or_cabinet, folder_id, folder_name, series_name, series_description, series_index_id, media_name, media_description, media_authors, media_notes, media_transcript, media_date, media_tags, media_type, media_file_extension, media_file_name, media_file_path, media_file_size_bytes, media_url, media_url_thumbnail, origin_location, origin_medium, origin_medium_notes, audio_lecturers, audio_video_length_seconds, image_photographer, image_color, image_location_or_people_unknown, image_professional_or_personal, legal_is_confidential, legal_can_license, workflow_batch_date, workflow_error, workflow_log, workflow_status, upload_started_at, upload_success_at, upload_failure_at, processing_started_at, processing_success_at, processing_failure_at, created_at, updated_at, deleted_at)
        VALUES (
            3, -- box_id
            '2018', -- box_name
            'B', -- box_or_cabinet
            3, -- folder_id
            'magazine clippings', -- folder_name
            null, -- series_name
            null, -- series_description
            null, -- series_index_id
            'Full-Grown Chimpanzees: The Hot Gift This Holiday Season', -- media_name
            'Caring for your chimpanzee pal.', -- media_description
            'Lyndsie Funke', -- media_authors
            null, -- media_notes
            null, -- media_transcript
            null, -- media_date
            'advice, lifestyle, special interest', -- media_tags
            'document', -- media_type
            'PDF', -- media_file_extension
            'care.pdf', -- media_file_name
            'uploads/care.pdf', -- media_file_path
            256, -- media_file_size_bytes
            'https://i.imgur.com/fqRBCko.jpg', -- media_url
            'https://i.imgur.com/fqRBCko.jpg', -- media_url_thumbnail
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

exports.down = async (db) => {
    await db.run('TRUNCATE TABLE media;');
};
