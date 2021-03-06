const authenticated = require('./decorator/authenticated');
const config = require('../../config');
const logger = require('../logger').get(module);
const notbot = require('./decorator/notbot');
const state = require('../state');

module.exports = {
    @notbot
    @authenticated(authorId => authorId === config.authorDiscordId)
    run(message, argument) {
        if (config.lockId === undefined) {
            message.channel.send('No lock; running in single-instance mode');
            state.haveLock = true;
        } else if (argument === config.lockId) {
            message.channel.send(`Lock acquired: ${config.lockId}`);
            state.haveLock = true;
        } else {
            message.channel.send(`Lock released: ${config.lockId}`);
            state.haveLock = false;
        }
    }
};
