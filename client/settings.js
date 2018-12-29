/*
 * Access shared config constants.
 * CONFIG is a global created by config-webpack that contains shared client/server settings.
 * See github.com/arthanzel/node-config-webpack.
 */

const SETTINGS = {
    NODE_ENV: _CONFIG.NODE_ENV,
    UPLOAD_STATUSES: _CONFIG.CONSTANTS.UPLOAD_STATUSES,
    DIRECTORY_CONTENT_TYPES: _CONFIG.CONSTANTS.DIRECTORY_CONTENT_TYPES,
    FILE_EXT_WHITELIST: _CONFIG.CONSTANTS.FILE_EXT_WHITELIST,
};

// validate that all settings are actually defined
Object.keys(SETTINGS).forEach((key) => {
    if (typeof SETTINGS[key] === 'undefined') {
        throw new Error(`Required setting "${key}" not found in config files.`);
    }
});

export default SETTINGS;
