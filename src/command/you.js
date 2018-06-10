const config = require('../../config');
const locked = require('./decorators/locked');
const notbot = require('./decorators/notbot');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        message.channel.send({
            file: config.avatarUrl
        });
    }
};
