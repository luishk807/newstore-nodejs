const queueService = require('./services/queues/queue.service');
const qbQueueProcessorService = require('./services/queues/queueProcessor.service');

async function startQueueService() {
    await queueService.start();
}

async function stopQueueService() {
    await queueService.stop();
}

function startQueueProcessor() {
    qbQueueProcessorService.init();
}

function stopQueueProcessor() {
    return qbQueueProcessorService.shutdown();
}

module.exports = {
    startQueueService,
    stopQueueService,
    startQueueProcessor,
    stopQueueProcessor
};
