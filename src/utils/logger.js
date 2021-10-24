const winston = require('winston');
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        webhook: 2,
        info: 3,
        debug: 4
    }
}
const logger = winston.createLogger({
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs.log' }),
        new winston.transports.File({ filename: 'webhooks.log', level: 'webhook'})
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

module.exports = logger;
