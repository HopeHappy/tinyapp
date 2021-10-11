// Function to generate a n-digit random shortURL
const generateRandomString = function(n) {
  const char = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = char.length;

  let result = '';
  let i = 1;
  while (i <= n) {
    const randomIndex = Math.floor(Math.random() * length);
    result += char[randomIndex];
    i++;
  }
  return result;
};

// Function to get user from users object by email
const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) return users[userId];
  }
  return undefined;
};

// Function to returns URLs of the specific user
const urlsForUser = function(id, urlDatabases) {
  let urlDatabaseForSpecificUser = {};
  for (let shortURL in urlDatabases) {
    if (urlDatabases[shortURL].userID === id) {
      const key = shortURL;
      const value = urlDatabases[shortURL];
      urlDatabaseForSpecificUser[key] = value;
    }
  }
  return urlDatabaseForSpecificUser;
};

// Stretch - Analytics
// Function to calculte the amount of unique visitor
const uniqueVisits = function(records) {
  let sum = 0;
  const idCollection = [];
  for(let record of records) {
    if (!idCollection.includes(record.visitId)) {
      idCollection.push(record.visitId);
      sum++;
    }
  }
  return sum;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser, uniqueVisits };