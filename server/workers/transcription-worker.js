const config = require('config');
const logger = require('../services/logger');
const sql = require('sql-template-strings');
const pdf = require('pdf-parse');
const isEmpty = require('lodash/isEmpty');

const db = require('../services/database');
const s3Service = require('../services/s3');

const WORKER_DELAY_MS = 500; // 0.5s
const WORKER_FINISHED_DELAY_MS = 1000 * 15 // 15s
const WORKER_ERRORED_DELAY_MS = 1000 * 30 // 30s
const UPLOAD_STATUSES = config.get('CONSTANTS.UPLOAD_STATUSES');
const MEDIA_TRANSCRIPTION_TYPES = config.get('CONSTANTS.MEDIA_TRANSCRIPTION_TYPES');
const REGEX_MULTI_WHITESPACE = new RegExp('[ \t]{2,}', 'g');
const REGEX_MULTI_NEWLINE = new RegExp('[\n]{2,}', 'g');


/**
 * Select a random PDF upload with no transcript and attempt to parse one.
 */
async function run() {
    logger.info('transcription worker starting new run')
    let delay = WORKER_DELAY_MS;

    try {
        // fetch an arbitrary un-transcripted PDF from the DB
        const row = await _getNextPdfForTranscription();

        // download and parse the PDF if exists
        if (!isEmpty(row)) {
            const stream = s3Service.streamObject(row.s3url);
            const parsed = await _parsePdfBuffer(stream);
            const parsedTranscript = _sanitizeTranscript(parsed);

            // if output contains text, save the result to the DB
            if (parsedTranscript) {
                await _updateTranscript(row.id, parsedTranscript, true);
                logger.info(`successfully transcripted ${ row.path } (#${ row.id })`);
            }

            // else mark that transcription occurred, but keep original transcript
            else {
                await _updateTranscript(row.id, row.transcript, false);
                logger.info(`transcription succeeded but returned no content for ${ row.path } (#${ row.id })`);
            }
        }

        // else we have transcripted all PDFs
        else {
            logger.info('transcription worker finished: no un-transcripted PDFs');
            delay = WORKER_FINISHED_DELAY_MS;
        }
    }
    catch (err) {
        delay = WORKER_ERRORED_DELAY_MS;
        logger.error(err);
        // attempt to register failure to DB
        if (!isEmpty(row)) {
            try {
                await _updateTranscript(row.id, row.transcript, false);
            }
            catch (err) {
                logger.error(err);
            }
        }
    }
    setTimeout(run, delay);
}
module.exports = { run };


/**
 * Parse the readableStream for a PDF file and extract text.
 */
async function _parsePdfBuffer(stream) {
    let chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('end', () => {
            const buf = Buffer.concat(chunks);
            pdf(buf).then(parsed => resolve(parsed.text)).catch(reject);
        });
        stream.on('error', reject);
    });
}


/**
 * Remove extra whitespace and newlines from the transcript.
 */
function _sanitizeTranscript(text) {
    return text.replace(REGEX_MULTI_WHITESPACE, ' ')
        .trim()
        .replace(REGEX_MULTI_NEWLINE, '\n')
        .trim();
}


/**
 * Fetch the next PDF that has not yet been transcripted.
 */
async function _getNextPdfForTranscription() {
    const query = sql`
        SELECT
            id,
            media_url AS s3url,
            media_transcript AS transcript,
            media_file_path AS path
        FROM media
        WHERE upload_status = ${ UPLOAD_STATUSES.SUCCESS }
        AND media_file_extension = 'PDF'
        AND (
            media_transcription_method IS NULL
            OR media_transcription_method = ${ MEDIA_TRANSCRIPTION_TYPES.MANUAL }
        )
        AND media_transcription_method_success IS NOT TRUE
        ORDER BY RANDOM()
        LIMIT 1;
    `;
    return db.get(query);
}


/**
 * Update the transcript of the media with the given ID.
 */
async function _updateTranscript(mediaId, transcriptText, isSuccess) {
    const query = sql`
        UPDATE media
        SET
            media_transcript = ${ transcriptText },
            media_transcription_method = ${ MEDIA_TRANSCRIPTION_TYPES.PDF },
            media_transcription_method_success = ${ isSuccess }
        WHERE id = ${ mediaId };
    `;
    return db.exec(query);
}
