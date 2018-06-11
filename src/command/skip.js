const locked = require('./decorator/locked');
const notbot = require('./decorator/notbot');
const NothingPlayingError = require('../error/NothingPlayingError');
const player = require('../audio/player');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        player.skip().then(() => {
            message.channel.send('Skipping.');
        }).catch(caught => {
            if (caught instanceof NothingPlayingError) {
                message.channel.send('Nothing is playing!');
            } else if (caught instanceof StoppingError) {
                message.channel.send('Currently stopping. Wait a moment.');
            } else {
                return caught;
            }
        });
    }
};
