const config = require('../../config');
const locked = require('./decorator/locked');
const notbot = require('./decorator/notbot');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        message.channel.send({
            file: config.avatarUrl
        });
    }
};
