const path = require('path');
const winston = require('winston');

function getLabel(callingModule) {
    return path.relative(path.dirname(module.filename), callingModule.filename);
};

module.exports = {
    get(callingModule) {
        return new(winston.Logger)({
            transports: [
                new(winston.transports.Console)({
                    label: getLabel(callingModule),
                    timestamp: true,
                    colorize: true,
                    level: 'debug'
                })
            ]
        });
    }
};
