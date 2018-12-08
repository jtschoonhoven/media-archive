const db = require('../services/database');
const logger = require('../services/logger');

const EXAMPLE_DATA = {
    files: [{ name: 'testing.png' }],
    directories: [{ name: 'uploads' }],
};


module.exports.load = async () => {
    return EXAMPLE_DATA;
};
