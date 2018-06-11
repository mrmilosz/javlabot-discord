const CONFIG_FILE_NAME = 'config.json';

const config = (() => {
    try {
        return require(`../${CONFIG_FILE_NAME}`);
    } catch (caught) {
        const fs = require('fs');
        fs.writeFileSync(CONFIG_FILE_NAME, fs.readFileSync(`template/${CONFIG_FILE_NAME}`));
        return require(`../${CONFIG_FILE_NAME}`);
    }
})();
const discord = require('discord.js');
const logger = require('./logger').get(module);
const state = require('./state');

module.exports = {
    run() {
        if (config.botNotConfigured) {
            logger.warn(`Your bot is not configured. Please edit ${CONFIG_FILE_NAME}.`);
            return;
        }

        const client = new discord.Client();

        client.on('ready', () => {
            logger.info(`Logged in as ${client.user.tag}`);
        });

        client.on('message', message => {
            logger.info(`Got message from ${message.author.username}: ${message.content}`);

            if (!isCommandString(message.content)) {
                return;
            }

            const [commandName, argument] = parseCommandString(message.content);

            if (!isValidCommandName(commandName)) {
                logger.info(`Invalid comand: ${commandName}`);
                handleUnimplementedCommand(message.channel, commandName);
            }

            try {
                Promise.all([require(`./command/${commandName}`).run(message, argument)]).catch(caught => {
                    handleCommandCaught(message, commandName, caught);
                });
            } catch (caught) {
                handleCommandCaught(message, commandName, caught);
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
    }
};

function isCommandString(messageContent) {
    return /^!![^!\s]/.test(messageContent);
}

function parseCommandString(commandString) {
    const commandStringWithoutMarker = commandString.slice(2);
    const index = commandStringWithoutMarker.search(/\s/);
    if (index === -1) {
        return [commandStringWithoutMarker, ''];
    }
    return [commandStringWithoutMarker.slice(0, index), commandStringWithoutMarker.slice(index + 1)];
}

function isValidCommandName(commandName) {
    return !commandName.includes('/');
}

function handleCommandCaught(message, commandName, caught) {
    if (caught instanceof Error) {
        if (caught.code === 'MODULE_NOT_FOUND') {
            logger.info(`Could not find module ${commandName}: ${caught.stack}`);
        } else {
            logger.warn(`Could not run command ${commandName}: ${caught.stack}`);
        }
    } else {
        logger.warn(`Could not run command ${commandName}: ${caught}`);
    }
    handleUnimplementedCommand(message.channel, commandName);
}

function handleUnimplementedCommand(channel, commandName) {
    if (state.haveLock) {
        channel.send(`The ${commandName} command is not implemented! ` +
            `Perhaps that moron, <@${config.authorDiscordId}>, didn't implement it...`);
    }
}
