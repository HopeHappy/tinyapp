const { assert } = require('chai');
const { urlsForUser } = require('../helpers.js');

const testUrlDatabases = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3BoFF: { longURL: "https://www.example.edu", userID: "aJ23l1" },
};

describe('#urlsForUser', () => {

  it('returns a personal urlDatabase with existent userID', () => {
    const output = urlsForUser("aJ48lW", testUrlDatabases);
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    assert.deepEqual(output, expectedOutput);
  });

  it('returns a personal urlDatabase with existent userID', () => {
    const output = urlsForUser("aJ23l1", testUrlDatabases);
    const expectedOutput = {
      i3BoFF: { longURL: "https://www.example.edu", userID: "aJ23l1" }
    };
    assert.deepEqual(output, expectedOutput);
  });

  it('returns a empty object with non-existent userID', () => {
    const output = urlsForUser("aaaaaa", testUrlDatabases);
    const expectedOutput = {};
    assert.deepEqual(output, expectedOutput);
  });

});