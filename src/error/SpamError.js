class SpamError {
    constructor(message) {
        this.name = 'SpamError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
SpamError.prototype = Object.create(Error.prototype);
module.exports = SpamError;
