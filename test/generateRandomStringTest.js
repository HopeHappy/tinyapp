const { assert } = require('chai');
const { generateRandomString } = require('../helpers.js');

describe('#generateRandomString', () => {

  it('returns 2-digit length string with the parameter 2', () => {
    const output = generateRandomString(2).length;
    const expectedOutput = 2;
    assert.strictEqual(output, expectedOutput);
  });

  it('returns 6-digit length string with the parameter 6', () => {
    const output = generateRandomString(6).length;
    const expectedOutput = 6;
    assert.strictEqual(output, expectedOutput);
  });

});