const assert = require('assert');
const queueService = require('../src/services/queues/queue.service');
const TEST_TOPIC = 'TEST_TOPIC';

describe('Queue Service', function() {

    let received = 0;

    before(async function() {
        await queueService.start();
    });

    beforeEach(function() {
        received = 0;
    });

    after(async function() {
        await queueService.stop();
    });

    afterEach(function() {
        queueService.unsubscribe(TEST_TOPIC);
    })

    it('should get event from topic twice (2x) after reporting job failed on the first time', function(done) {
        this.timeout(30000);
        let id = null;
        queueService.subscribe(TEST_TOPIC, function(job) {
            received++;
            console.log('received', received);
            console.log(job);
            // Force fail
            if (received === 1) {
                id = job.id;
                job.done('Fake Error');
            }

            // Success on 2nd
            if (received === 2) {
                job.done();
                assert.equal(received, 2);
                assert.equal(job.id, id);
                done();
            }
        });

        // Retry limit 2, 10 seconds delay between retries
        queueService.publish(TEST_TOPIC, { kk: 'cute' }, { retryLimit: 2, retryDelay: 10 });
    });

    // it('should fail on first and restart queue to receive retry event', function(done) {
    //     this.timeout(60000);
    //     queueService.subscribe(TEST_TOPIC, async function(job) {
    //         console.log('Received event');
    //         received++;
    //         // Force fail
    //         if (received === 1) {
    //             console.log('Force to fail job');
    //             job.done('Fake Error');
    //             console.log('Unsubscribing from ' + TEST_TOPIC);
    //             queueService.unsubscribe(TEST_TOPIC);
    //             console.log('Stopping queue service');
    //             await queueService.stop();
    //             console.log('Starting queue service');
    //             await queueService.start();
    //             const done = done;
    //             console.log('Resubscribing after queue service restart');
    //             queueService.subscribe(TEST_TOPIC, function(innerJob) {
    //                 console.log('Receiving from second subscription');
    //                 innerJob.done();
    //                 done();
    //             })
    //         }
    //     });

    //     // Retry limit 2, 10 seconds delay between retries
    //     queueService.publish(TEST_TOPIC, { kk: 'lovely' }, { retryLimit: 5, retryDelay: 10 });
    // });

});
