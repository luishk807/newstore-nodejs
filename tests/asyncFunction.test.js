const assert = require('assert');

const AsyncFunction = (async function() {}).constructor;

describe('AsyncFunction', function() {

    it('should be a valid async function check', function() {
        const testFunc = async function () { return true; };
        assert.strictEqual(testFunc instanceof AsyncFunction, true);
    });

    it('should be not an async function when checked', function() {
        const testFunc = function () { return true; };
        assert.strictEqual(testFunc instanceof AsyncFunction, false);
    });

    it('should be valid when Promise.resolve a function', function() {
        const testFunc = Promise.resolve(function () { return true; })
        assert.strictEqual(testFunc instanceof Promise, true);
    });

});