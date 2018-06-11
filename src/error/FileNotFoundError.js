class FileNotFoundError {
    constructor(message) {
        this.name = 'FileNotFoundError';
        this.message = message;
        this.stack = new Error().stack;
    }
}
FileNotFoundError.prototype = Object.create(Error.prototype);
module.exports = FileNotFoundError;
