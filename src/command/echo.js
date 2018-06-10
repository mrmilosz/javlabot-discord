const locked = require('./decorator/locked');
const notbot = require('./decorator/notbot');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        if (argument !== '') {
            message.channel.send(argument);
        }
    }
};
