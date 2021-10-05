const PgBoss = require('pg-boss');
const { queues } = require('../../config');
const { getGlobalLogger } = require('../../utils/logger.utils');
const logger = getGlobalLogger();
const boss = new PgBoss({
    host: queues.pgBoss.dbHost,
    database: queues.pgBoss.dbName,
    user: queues.pgBoss.dbUser,
    password: queues.pgBoss.dbPwd
});

class QueuePgBossService {
    constructor() {
        boss.on('error', error => logger.error(error));
        boss.on('stopped', () => logger.info('QueueService has stopped!'));
    }

    /**
     * Starts the queue service
     * @returns Promise
     */
    start() {
        logger.info('QueueService: starting up');
        return boss.start();
    }

    /**
     * Stops the queue service
     * @returns Promise
     */
    stop() {
        logger.info('QueueService: stopping');
        return boss.stop();
    }

    /**
     * Alias for publish. Queue a message/data to the given queue name/topic
     * @param {string} name 
     * @param {*} data 
     * @param {*} options
     * @returns Promise
     */
    queue(name, data, options = {}) {
        return this.publish(name, data, options);
    }

    /**
     * Queue a message/data to the given queue name/topic
     * @param {string} name 
     * @param {*} data 
     * @param {*} options
     * @returns Promise
     */
    publish(name, data, options = {}) {
        return boss.publish(name, data, options);
    }

    /**
     * Subscrige to the topic with the given name
     * @param {string} name 
     * @param {*} asyncHandler 
     * @returns Promise
     */
    subscribe(name, asyncHandler) {
        return boss.subscribe(name, asyncHandler);
    }

    /**
     * Unsubscribe from the given topic name
     * @param {string} name 
     * @returns Promise
     */
    unsubscribe(name) {
        return boss.unsubscribe(name);
    }

    onComplete(name) {
        // Not sure if I need the on
        return boss.onComplete(name, job => {
            logger.info(`Job complete ${name}`, JSON.stringify(job));
        });
    }
}

const service = new QueuePgBossService();

module.exports = service;
