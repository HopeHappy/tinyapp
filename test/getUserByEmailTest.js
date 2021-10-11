const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('#getUserByEmail', () => {

  it('returns a user object with valid email', () => {
    const output = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(output, expectedOutput);
  });

  it('returns undefined with non-existent email', () => {
    const output = getUserByEmail("user1@example.com", testUsers);
    assert.isUndefined(output);
  });

});