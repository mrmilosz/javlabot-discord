const authenticated = require('./decorator/authenticated');
const config = require('../../config');
const logger = require('../logger').get(module);
const state = require('../state');

module.exports = {
    @authenticated(authorId => authorId === config.authorDiscordId)
    run(message, argument) {
        if (argument === config.lockId) {
            logger.info('Acquiring lock');
            state.haveLock = true;
        } else {
            logger.info('Releasing lock');
            state.haveLock = false;
        }
    }
};