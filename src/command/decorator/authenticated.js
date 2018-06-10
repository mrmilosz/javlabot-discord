module.exports = isAuthenticated => (target, key, descriptor) => {
    const originalFunction = descriptor.value;
    descriptor.value = function() {
        if (!isAuthenticated(arguments[0].author.id)) {
            throw new Error(`User not authenticated according to ${isAuthenticated}`);
        }
        originalFunction.apply(target, arguments);
    }
    return descriptor;
};
