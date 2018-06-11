const logger = require('../logger').get(module);
const NothingPlayingError = require('../error/NothingPlayingError');
const NoVoiceChannelError = require('../error/NoVoiceChannelError');
const SpamError = require('../error/SpamError');
const StoppingError = require('../error/StoppingError');

const MAX_PLAY_QUEUE_SIZE = 3;

let playQueueSize = 0;
let readyToPlay = Promise.resolve();
let dispatcher = null;
let stopping = false;

module.exports = {
    play(voiceChannel, playFunction) {
        if (stopping) {
            return Promise.reject(new StoppingError());
        }

        if (voiceChannel === undefined) {
            return Promise.reject(new NoVoiceChannelError('A voice channel is required to play something!'));
        }

        if (playQueueSize >= MAX_PLAY_QUEUE_SIZE) {
            return Promise.reject(new SpamError('Too many sounds! Wait until there are fewer in the pipeline.'));
        }

        ++playQueueSize;
        logger.info(`${playQueueSize} sounds in queue`);

        readyToPlay = readyToPlay.then(
            () => joinUnlessStopping(voiceChannel),
            () => joinUnlessStopping(voiceChannel)
        ).then(connection => new Promise((resolve, reject) => {
            dispatcher = playFunction(connection);

            dispatcher.on('end', reason => {
                resolve();
            });

            dispatcher.on('error', caught => {
                reject(caught);
            });
        })).catch(caught => {
            if (caught instanceof StoppingError) {
                return Promise.resolve();
            } else {
                return caught;
            }
        }).finally(() => {
            --playQueueSize;
            logger.info(`${playQueueSize} sounds in queue`);
            voiceChannel.leave();
        });

        return readyToPlay;
    },

    skip() {
        if (stopping) {
            return Promise.reject(new StoppingError());
        }

        return skip();
    },

    stop() {
        if (stopping) {
            return Promise.reject(new StoppingError());
        }

        logger.info('Setting stopping state');
        stopping = true;
        return skip().then(() => {
            return readyToPlay;
        }).finally(() => {
            logger.info('Unsetting stopping state');
            stopping = false;
        });
    }
};

function joinUnlessStopping(voiceChannel) {
    if (!stopping) {
        return voiceChannel.join();
    } else {
        return Promise.reject(new StoppingError());
    }
}

function skip() {
    return new Promise((resolve, reject) => {
        if (dispatcher !== null) {
            dispatcher.on('end', reason => {
                resolve();
            });
            dispatcher.end();
            dispatcher = null;
        } else {
            reject(new NothingPlayingError());
        }
    });
}
