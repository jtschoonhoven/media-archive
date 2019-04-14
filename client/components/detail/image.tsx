import * as React from 'react';
import urlJoin from 'url-join';

import SETTINGS from '../../settings';

const MEDIA_TYPES = SETTINGS.MEDIA_TYPES;
const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const FILE_EXT_WHITELIST = SETTINGS.FILE_EXT_WHITELIST;
const API_URLS = SETTINGS.API_URLS;


/*
 * Return a standard IMG tag.
 */
function getImgTag(src, alt) {
    return <img src={ src } className="img-fluid border rounded" alt={ alt } />;
}

/*
 * Return an HTML5 AUDIO tag with controls.
 */
function getAudioTag(src) {
    return (
        <audio controls src={ src }>
            Sorry, your browser does not support embedded audio.
        </audio>
    );
}

/*
 * Return an HTML5 VIDEO tag with controls.
 */
function getVideoTag(src, mimeType) {
    return (
        <video controls>
            <source src={ src } type={ mimeType } />
            Sorry, your browser does not support embedded video.
        </video>
    );
}

/*
 * Generate an iframe with the document embedded.
 * See gist.github.com/tzmartin/1cf85dc3d975f94cfddc04bc0dd399be#google-docs-viewer.
 *
 * Claims to support:
 * - images (JPG, PNG, GIF, TIFF, BMP, SVG, AI, PSD)
 * - videos (WEBM, MP4, 3GPP, MOV, AVI, MPEGPS, WMV, FLV)
 * - documents (TXT, PDF, DOC(x), XLS(X), PPT(X))
 * - ...and many more!
 */
function getEmbedTag(url) {
    return (
        <iframe
            src={ `https://docs.google.com/viewer?url=${url}&embedded=true` }
            className="w-100"
            frameBorder="0"
        >
            <p>Loading...</p>
        </iframe>
    );
}

export default (detailsModel) => {
    const extension = detailsModel.extension ? detailsModel.extension.toUpperCase() : 'OTHER';
    const extensionInfo = FILE_EXT_WHITELIST[extension];
    const filename = detailsModel.filename;
    const url = detailsModel.url;
    const type = detailsModel.type;

    // only attempt to embed the media if the upload has succeeded
    if (detailsModel.uploadStatus === UPLOAD_STATUSES.SUCCESS) {
        // image files can be linked to directly
        if (type === MEDIA_TYPES.IMAGE) {
            return getImgTag(url, filename);
        }
        // document files must be embedded in an iframe
        if (type === MEDIA_TYPES.document) {
            return getEmbedTag(url);
        }
        // use HTML5 AUDIO tag for audio types
        if (type === MEDIA_TYPES.AUDIO) {
            return getAudioTag(url);
        }
        // use HTML5 VIDEO tag for video types
        if (type === MEDIA_TYPES.VIDEO) {
            return getVideoTag(url, extensionInfo.mimeType);
        }
        // if something has gone wrong and type is not available, fall back to iframe
        return getEmbedTag(url);
    }

    const src = urlJoin(API_URLS.THUMBNAILS, extension.toLowerCase());
    return getImgTag(src, filename);
};
