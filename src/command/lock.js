const authenticated = require('./decorator/authenticated');
const config = require('../../config');
const logger = require('../logger').get(module);
const state = require('../state');

module.exports = {
    @authenticated(authorId => authorId === config.authorDiscordId)
    run(message, argument) {
        if (argument === config.lockId) {
            message.channel.send(`Lock acquired: ${config.lockId}`);
            state.haveLock = true;
        } else {
            message.channel.send(`Lock released: ${config.lockId}`);
            state.haveLock = false;
        }
    }
};
