const locked = require('./decorator/locked');

module.exports = {
    @locked
    run(message, argument) {
        if (argument !== '') {
            message.channel.send(argument);
        }
    }
};
