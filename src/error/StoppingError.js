class StoppingError {
    constructor(message) {
        this.name = 'StoppingError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
StoppingError.prototype = Object.create(Error.prototype);
module.exports = StoppingError;
