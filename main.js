const config = require('./config.json');
const discord = require('discord.js');
const logger = require('./logger').get(module);

const client = new discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {
    logger.info(`Got message from ${message.author.username}: ${message.content}`);
    const match = message.content.match(/^!!(\w+)(?:\s(.*))?$/);
    if (!message.author.bot && match) {
        const [command, argument] = match.slice(1);
        try {
            require(`./commands/${command}`).run(message, argument);
        } catch (caught) {
            if (caught instanceof Error && caught.code === 'MODULE_NOT_FOUND') {
                logger.info(`Unimplemented command: ${command}`);
                message.channel.send(`The ${command} command is not implemented! Perhaps that moron, <@${config.authorDiscordId}>, didn't implement it...`);
            } else {
                logger.info(`Had an oopsie: ${caught}`);
            }
        }
    }
});

client.on('disconnect', (errorMessage, code) => {
    logger.info(`Disconnected with error message ${errorMessage}, ${code}`);
});

client.login(config.authToken);

process.on('SIGTERM', () => {
    client.destroy();
    process.exit(0);
});
