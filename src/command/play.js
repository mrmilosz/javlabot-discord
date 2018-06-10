const config = require('../../config');
const fs = require('fs');
const locked = require('./decorator/locked');
const logger = require('../logger').get(module);
const notbot = require('./decorator/notbot');
const path = require('path');

const MAX_SOUND_COUNT = 3;

let currentSoundCount = 0;
let readyToPlay = Promise.resolve();

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        if (message.member.voiceChannel === undefined) {
            message.reply('you must be in a voice channel to use this command!');
            return;
        }

        if (argument.includes('/')) {
            logger.debug(`Invalid filename: ${argument}`);
            handleInvalidFile(message.channel, argument);
            return;
        }

        const soundPath = path.join('sound', argument);

        if (currentSoundCount >= MAX_SOUND_COUNT) {
            message.channel.send('Too many sounds! Wait until there are fewer in the pipeline.');
            return;
        }

        ++currentSoundCount;

        readyToPlay = readyToPlay.then(() => new Promise(resolve => {
            fs.exists(soundPath, fileExists => {
                if (!fileExists) {
                    logger.info(`No such file: ${soundPath}`);
                    handleInvalidFile(message.channel, argument);
                    resolve();
                    return;
                }

                message.member.voiceChannel.join().then(connection => {
                    const dispatcher = connection.playFile(soundPath);
                    dispatcher.on('end', reason => {
                        message.member.voiceChannel.leave();
                        --currentSoundCount;
                        resolve();
                    });
                }).catch(caught => {
                    logger.warn(`Could not play sound: ${caught}`);
                    message.member.voiceChannel.leave();
                    handleInvalidFile(message.channel, argument);
                    --currentSoundCount;
                    resolve();
                });
            });
        }));
    }
};

function handleInvalidFile(channel, filename) {
    channel.send(`No sound named ${filename}! Perhaps that moron, <@${config.authorDiscordId}>, didn't add it...`);
}
