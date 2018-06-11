const NoVoiceChannelError = require('../error/NoVoiceChannelError');
const SpamError = require('../error/SpamError');

const MAX_PLAY_QUEUE_SIZE = 3;

let playQueueSize = 0;
let readyToPlay = Promise.resolve();

module.exports = {
    play(voiceChannel, playFunction) {
        if (voiceChannel === undefined) {
            return Promise.reject(new NoVoiceChannelError('A voice channel is required to play something!'));
        }

        if (playQueueSize >= MAX_PLAY_QUEUE_SIZE) {
            return Promise.reject(new SpamError('Too many sounds! Wait until there are fewer in the pipeline.'));
        }

        ++playQueueSize;

        readyToPlay = readyToPlay.then(
            () => voiceChannel.join(),
            () => voiceChannel.join()
        ).then(connection => new Promise((resolve, reject) => {
            const dispatcher = playFunction(connection);

            dispatcher.on('end', reason => {
                resolve();
            });

            dispatcher.on('error', caught => {
                reject(caught);
            });
        })).finally(() => {
            --playQueueSize;
            voiceChannel.leave();
        });

        return readyToPlay;
    }
};
