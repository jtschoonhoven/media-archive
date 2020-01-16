module.exports = {
    NODE_ENV: 'development',
    RDS_DB_NAME: 'postgres',
    RDS_HOSTNAME: '',
    RDS_PASSWORD: '',
    RDS_PORT: '5432',
    RDS_USERNAME: '',
    S3_BUCKET_NAME: 'media-archive-uploads-development',
    S3_BUCKET_REGION: 'us-west-2',
    CONSTANTS: {
        // regex for consistent string validation between server/client
        REGEX: {
            ALPHANUM_BLACKLIST: '[^a-zA-Z0-9]', // match any non-alphanumeric char
            FILENAME_BLACKLIST: '[^a-zA-Z0-9_\-~]', // match any char not allowed in file names
            MEDIA_TITLE_BLACKLIST: '[^a-zA-Z0-9 !&().-]', // match any char not allowed in title
            DUPLICATE_BLACKLIST: '([^a-zA-Z0-9])(?=\\1)', // match redundant non-alphanum chars
            TRIM_ENDS_BLACKLIST: '(^[^A-Za-z0-9~]+)|[^A-Za-z0-9]+$', // match bad chars at start/end
        },
        // backend API urls
        API_URLS: {
            SEARCH: '/api/v1/search',
            UPLOADS: '/api/v1/uploads',
            FILES: '/api/v1/files',
            USER: '/api/v1/user',
            THUMBNAILS: '/api/v1/thumbnails',
        },
        // categories of supported file types
        MEDIA_TYPES: {
            IMAGE: 'image',
            VIDEO: 'video',
            AUDIO: 'audio',
            DOCUMENT: 'document',
        },
        // types of objects found in a directory listing
        DIRECTORY_CONTENT_TYPES: {
            UPLOAD: 'upload',
            DIRECTORY: 'directory',
            FILE: 'file',
        },
        // extensions for supported microsoft ofice files
        MICROSOFT_FILE_EXTENSIONS: ['DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX'],
        // valid file extensions mapped to category and mime type
        FILE_EXT_WHITELIST: {
            // images
            JPG: { type: 'image', mimeType: 'image/jpeg' },
            JPEG: { type: 'image', mimeType: 'image/jpeg' },
            PNG: { type: 'image', mimeType: 'image/png' },
            // audio
            WAV: { type: 'audio', mimeType: 'audio/wav' },
            // video
            MP4: { type: 'video', mimeType: 'video/mp4' },
            // documents
            TIF: { type: 'document', mimeType: 'image/tiff' },
            TIFF: { type: 'document', mimeType: 'image/tiff' },
            PDF: { type: 'document', mimeType: 'application/pdf' },
            DOC: { type: 'document', mimeType: 'application/msword' },
            DOCX: { type: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            PPT: { type: 'document', mimeType: 'application/vnd.ms-powerpoint' },
            PPTX: { type: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
            XLS: { type: 'document', mimeType: 'application/vnd.ms-excel' },
            XLSX: { type: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            // special
            CSV: { type: 'document', mimeType: 'text/csv' },
        },
        // states of the upload lifecycle
        UPLOAD_STATUSES: {
            PENDING: 'pending',
            RUNNING: 'running',
            ABORTED: 'aborted',
            FAILURE: 'failure',
            SUCCESS: 'success',
        },
        // frontend may use short nicknames for certain column names
        MEDIA_TABLE_COLUMN_ALIASES: {
            'title': 'media_name',
            'description': 'media_description',
            'tags': 'media_tags',
            'isConfidential': 'legal_is_confidential',
            'canLicense': 'legal_can_license',
            'transcript': 'media_transcript',
        },
        // these columns may be directly edited via CSV uploads
        CSV_EDITABLE_COLUMN_WHITELIST: [
            'box_id',
            'box_name',
            'box_or_cabinet',
            'folder_id',
            'folder_name',
            'series_name',
            'series_description',
            'series_index_id',
            'media_name',
            'media_description',
            'media_authors',
            'media_notes',
            'media_transcript',
            'media_date',
            'media_tags',
            'media_file_path',
            'origin_location',
            'origin_medium',
            'origin_medium_notes',
            'audio_lecturers',
            'audio_video_length_seconds',
            'image_photographer',
            'image_color',
            'image_location_or_people_unknown',
            'image_professional_or_personal',
            'legal_is_confidential',
            'legal_can_license',
        ],
        MEDIA_TRANSCRIPTION_TYPES: {
            MANUAL: 'manual',
            PDF: 'pdf',
            OCR: 'ocr',
        }
    },
    CSV_UPLOAD_REQUIRED_FIELDS: ['id', 'uuid'],
};
