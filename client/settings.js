/*
 * Access shared config constants.
 * _CONFIG is a global created by config-webpack that contains shared client/server settings.
 * See github.com/arthanzel/node-config-webpack.
 */

const SETTINGS = {
    DIRECTORY_CONTENT_TYPES: _CONFIG.CONSTANTS.DIRECTORY_CONTENT_TYPES,
    FILE_EXT_WHITELIST: _CONFIG.CONSTANTS.FILE_EXT_WHITELIST,
    MEDIA_TYPES: _CONFIG.CONSTANTS.MEDIA_TYPES,
    MICROSOFT_FILE_EXTENSIONS: Object.values(_CONFIG.CONSTANTS.MICROSOFT_FILE_EXTENSIONS),
    NODE_ENV: _CONFIG.NODE_ENV,
    UPLOAD_STATUSES: _CONFIG.CONSTANTS.UPLOAD_STATUSES,
    API_URLS: _CONFIG.CONSTANTS.API_URLS,
    REGEX: _CONFIG.CONSTANTS.REGEX,
};

// validate that all settings are actually defined
Object.keys(SETTINGS).forEach((key) => {
    if (typeof SETTINGS[key] === 'undefined') {
        throw new Error(`Required setting "${key}" not found in config files.`);
    }
});

export default SETTINGS;
