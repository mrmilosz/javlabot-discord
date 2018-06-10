const playCommand = require('./play');

module.exports = {
    run: (message, argument) => {
        playCommand.run(message, 'fart.mp3');
    }
};
