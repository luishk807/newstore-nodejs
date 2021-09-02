const STATUS = Object.freeze({
    DISCONNECTED: -1,
    REFRESH_TOKEN_EXPIRED: -1,
    ACCESS_TOKEN_EXPIRED: 0,
    CONNECTED: 1
});

module.exports = {
    STATUS
}
