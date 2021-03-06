const assert = require('assert');
const { getDistinctValues } = require('../src/utils')

describe('Utils', function() {

    it('should return distinct values', function() {
        const values = [
            { brand: 'America' },
            { brand: 'Hong Kong' },
            { brand: 'America' },
            { brand: 'Hong Kong' },
            { brand: 'Japan' }
        ];
        const results = getDistinctValues(values, 'brand');
        assert.strictEqual(results.length, 3);
    })

});