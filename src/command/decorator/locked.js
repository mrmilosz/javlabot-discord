const state = require('../../state');

module.exports = (target, key, descriptor) => {
    const originalFunction = descriptor.value;
    descriptor.value = function() {
        if (state.haveLock) {
            originalFunction.apply(target, arguments);
        }
    };
    return descriptor;
};
