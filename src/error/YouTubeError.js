class YouTubeError {
    constructor(message) {
        this.name = 'YouTubeError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
YouTubeError.prototype = Object.create(Error.prototype);
module.exports = YouTubeError;
