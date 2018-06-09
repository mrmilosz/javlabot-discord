const config = require('../config');

module.exports = {
    run: (message, argument) => {
        message.channel.send({
            file: config.avatarUrl
        });
    }
};
