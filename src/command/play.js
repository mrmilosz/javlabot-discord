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

        readyToPlay = readyToPlay.finally(() => new Promise((resolve, reject) => {
            fs.exists(soundPath, fileExists => {
                if (fileExists) {
                    resolve();
                } else {
                    reject(new Error(`No such file: ${soundPath}`));
                }
            }, caught => {
                reject(caught);
            });
        })).then(() => {
            return message.member.voiceChannel.join();
        }).then(connection => new Promise((resolve, reject) => {
            const dispatcher = connection.playFile(soundPath);

            dispatcher.on('end', reason => {
                resolve();
            });

            dispatcher.on('error', caught => {
                handleInvalidFile(message.channel, argument);
                reject(caught);
            });
        })).catch(caught => {
            if (caught instanceof Error) {
                logger.info(`Could not play sound: ${caught.stack}`);
            } else {
                logger.info(`Could not play sound: ${caught}`);
            }
        }).finally(() => {
            --currentSoundCount;
            message.member.voiceChannel.leave();
        });
    }
};

function handleInvalidFile(channel, argument) {
    channel.send(`No sound named ${filename}! Perhaps that moron, <@${config.authorDiscordId}>, didn't add it...`);
}
