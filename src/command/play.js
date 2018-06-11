const config = require('../../config');
const FileNotFoundError = require('../error/FileNotFoundError');
const fs = require('fs');
const locked = require('./decorator/locked');
const logger = require('../logger').get(module);
const notbot = require('./decorator/notbot');
const NoVoiceChannelError = require('../error/NoVoiceChannelError');
const path = require('path');
const player = require('../audio/player');
const SpamError = require('../error/SpamError');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        if (argument.includes('/')) {
            logger.info(`Invalid filename: ${argument}`);
            handleInvalidFile(message.channel, argument);
            return;
        }

        const soundPath = path.join('sound', argument);

        new Promise((resolve, reject) => {
            fs.exists(soundPath, fileExists => {
                if (fileExists) {
                    resolve();
                } else {
                    reject(new FileNotFoundError(`No such file: ${soundPath}`));
                }
            }, caught => {
                handleInvalidFile(message.channel, argument);
                reject(caught);
            });
        }).then(() => {
            return player.play(message.member.voiceChannel, connection => connection.playFile(soundPath));
        }).catch(caught => {
            if (caught instanceof NoVoiceChannelError) {
                message.reply('you must be in a voice channel to use this command!');
            } else if (caught instanceof SpamError) {
                message.channel.send('Too many sounds! Wait until there are fewer in the pipeline.');
            } else if (caught instanceof FileNotFoundError) {
                handleInvalidFile(message.channel, argument);
            } else if (caught instanceof Error) {
                logger.warn(`Could not play sound: ${caught.stack}`);
            } else {
                logger.warn(`Could not play sound: ${caught}`);
            }
        });
    }
};

function handleInvalidFile(channel, argument) {
    channel.send(`No sound named ${argument}! Perhaps that moron, <@${config.authorDiscordId}>, didn't add it...`);
}
