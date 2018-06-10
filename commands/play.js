const config = require('../config.json');
const fs = require('fs');
const logger = require('../logger').get(module);
const path = require('path');

module.exports = {
    run: (message, argument) => {
        if (!argument.includes('/')) {
            const soundPath = path.join('sounds', argument);
            fs.exists(soundPath, exists => {
                if (exists) {
                    if (message.member.voiceChannel !== undefined) {
                        message.member.voiceChannel.join().then(connection => {
                            const dispatcher = connection.playFile(soundPath);
                            dispatcher.on('end', reason => {
                                message.member.voiceChannel.leave();
                            });
                        }).catch(caught => {
                            logger.warn(`Could not play sound: ${caught}`);
                            message.member.voiceChannel.leave();
                            handleInvalidFile(message.channel, argument);
                        });
                    }
                    else {
                        message.reply('you must be in a voice channel to use this command!');
                    }
                } else {
                    logger.info(`No such file: ${soundPath}`);
                    handleInvalidFile(message.channel, argument);
                }
            });
        } else {
            logger.debug(`Invalid filename: ${argument}`);
            handleInvalidFile(message.channel, argument);
        }
    }
};

function handleInvalidFile(channel, filename) {
    channel.send(`No sound named ${filename}! Perhaps that moron, <@${config.authorDiscordId}>, didn't add it...`);
}
