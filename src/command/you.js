const config = require('../../config');
const locked = require('./decorators/locked');

module.exports = {
    @locked
    run(message, argument) {
        message.channel.send({
            file: config.avatarUrl
        });
    }
};
