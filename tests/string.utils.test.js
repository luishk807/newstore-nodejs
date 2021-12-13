const assert = require('assert');
const { getStringBooleanValue } = require('../src/utils/string.utils');

describe('String utils tests', function() {
    it('should return false when given undefined value', function() {
        const baseData = {};
        const result = getStringBooleanValue(baseData.taxable);
        assert.equal(result, false);
    })

    it("should return false when given 'true' value", function() {
        const result = getStringBooleanValue('true');
        assert.equal(result, true);
    })

    it("should return false when given 'false' value", function() {
        const result = getStringBooleanValue('false');
        assert.equal(result, false);
    })
})
