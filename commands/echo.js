module.exports = {
    run: (message, argument) => {
        if (argument !== '') {
            message.channel.send(argument);
        }
    }
};
