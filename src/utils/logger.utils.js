/** Returns the global logger instance or a logger skeleton that does nothing so unit tests does not break */
function getGlobalLogger() {
    return global.logger || { info: () => {}, debug: () => {}, error: () => {}, warn: () => {} };
}

module.exports = {
    getGlobalLogger
}