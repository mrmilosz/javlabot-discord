module.exports = (target, key, descriptor) => {
    const originalFunction = descriptor.value;
    descriptor.value = function() {
        if (!arguments[0].author.bot) {
            originalFunction.apply(target, arguments);
        }
    }
    return descriptor;
};
