class NothingPlayingError {
    constructor(message) {
        this.name = 'NothingPlayingError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
NothingPlayingError.prototype = Object.create(Error.prototype);
module.exports = NothingPlayingError;
