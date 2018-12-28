/*
 * Access shared config constants.
 * CONFIG is a global created by config-webpack that contains shared client/server settings.
 * See github.com/arthanzel/node-config-webpack.
 */

const SETTINGS = {
    NODE_ENV: CONFIG.NODE_ENV,
    UPLOAD_STATUSES: CONFIG.CONSTANTS.UPLOAD_STATUSES,
    DIRECTORY_CONTENT_TYPES: CONFIG.CONSTANTS.DIRECTORY_CONTENT_TYPES,
};

// validate that all settings are actually defined
Object.keys(SETTINGS).forEach((key) => {
    if (typeof SETTINGS[key] === 'undefined') {
        throw new Error(`Required setting "${key}" not found in config files.`);
    }
});

export default SETTINGS;
