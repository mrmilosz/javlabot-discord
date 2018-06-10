const config = require('./config.json');
const discord = require('discord.js');
const logger = require('./logger').get(module);

const client = new discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {
    logger.info(`Got message from ${message.author.username}: ${message.content}`);

    const commandCue = '!!';
    if (message.content.startsWith(commandCue)) {
        const [commandName, argument] = parseCommand(message.content.substring(commandCue.length));
        if (!message.author.bot && commandName !== '') {
            if (isValid(commandName)) {
                try {
                    require(`./commands/${commandName}`).run(message, argument);
                } catch (caught) {
                    if (caught instanceof Error && caught.code === 'MODULE_NOT_FOUND') {
                        logger.debug(`Module not found: ${commandName}; Reason: ${caught}`);
                    }
                    else {
                        logger.warn(`Could not run command ${commandName}: ${caught}`);
                    }
                    handleUnimplementedCommand(message.channel, commandName);
                }
            }
            else {
                logger.debug(`Invalid comand: ${commandName}`);
                handleUnimplementedCommand(message.channel, commandName);
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

function parseCommand(relevantMessageContent) {
    const index = relevantMessageContent.search(/\s/);
    if (index === -1) {
        return [relevantMessageContent, ''];
    }
    return [relevantMessageContent.slice(0, index), relevantMessageContent.slice(index + 1)];
}

function isValid(commandName) {
    return !commandName.includes('/');
}

function handleUnimplementedCommand(channel, commandName) {
    channel.send(`The ${commandName} command is not implemented! ` +
        `Perhaps that moron, <@${config.authorDiscordId}>, didn't implement it...`);
}

