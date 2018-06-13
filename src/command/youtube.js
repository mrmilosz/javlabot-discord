const locked = require('./decorator/locked');
const logger = require('../logger').get(module);
const notbot = require('./decorator/notbot');
const NoVoiceChannelError = require('../error/NoVoiceChannelError');
const player = require('../audio/player');
const SpamError = require('../error/SpamError');
const StoppingError = require('../error/StoppingError');
const url = require('url');
const YouTubeError = require('../error/YouTubeError');
const ytdl = require('ytdl-core');

module.exports = {
    @locked
    @notbot
    run(message, argument) {
        return new Promise((resolve, reject) => {
            try {
                resolve(ytdl(argument, {
                    filter: 'audioonly'
                }, {
                    seek: 0,
                    volume: 1
                }));
            } catch (caught) {
                reject(new YouTubeError(caught));
            }
        }).then(stream => {
            return player.play(message.member.voiceChannel, connection => connection.playStream(stream));
        }).catch(caught => {
            if (caught instanceof NoVoiceChannelError) {
                message.reply('you must be in a voice channel to use this command!');
            } else if (caught instanceof SpamError) {
                message.channel.send('Too many sounds! Wait until there are fewer in the pipeline.');
            } else if (caught instanceof StoppingError) {
                message.channel.send('Currently stopping. Wait a moment.');
            } else if (caught instanceof YouTubeError) {
                var videoId = url.parse(argument, true).query['v'];
                message.channel.send(`Could not play video ${videoId || `with malformed URL ${argument} `}.`);
            } else if (caught instanceof Error) {
                logger.warn(`Could not play sound: ${caught.stack}`);
            } else {
                logger.warn(`Could not play sound: ${caught}`);
            }
        });
    }
};
