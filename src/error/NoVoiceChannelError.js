class NoVoiceChannelError {
    constructor(message) {
        this.name = 'NoVoiceChannelError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
NoVoiceChannelError.prototype = Object.create(Error.prototype);
module.exports = NoVoiceChannelError;
