const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(cookieSession({
  name:'session',
  keys: 'secretKey'
}));

// Object to store URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// Object to store email and password
const users = {
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

// Function to find user from users object by email
const findUserByEmail = function(email) {
  for (let userId in users) {
    if (users[userId].email === email) return users[userId];
  }
  return undefined;
};

// Function to returns URLs of the specific user
const urlsForUser = function(id) {
  let urlDatabaseForSpecificUser = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      const key = shortURL;
      const value = urlDatabase[shortURL];
      urlDatabaseForSpecificUser[key] = value;
    }
  }
  return urlDatabaseForSpecificUser;
};

// GET /home - render
app.get("/home", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user };

  res.render('urls_home', templateVars);
});

// GET /urls - render
app.get('/urls', (req, res) => {
  const user_id = req.cookies.user_id;

  // If user access to /urls/new without login
  if (!user_id) {
    const templateVars = { user: null, error: 'Please login first!' };
    return res.status(403).render('urls_login', templateVars);
  }

  const urlDatabase = urlsForUser(user_id);
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase, error: null };

  res.render('urls_index', templateVars);
});

// POST /urls - redirect to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  
  res.redirect(`/urls/${shortURL}`);
});

// GET /urls/new - render
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies.user_id;

  // If user access to /urls/new without login
  if (!user_id) {
    const templateVars = { user: null, error: 'Please login first!' };
    return res.status(403).render('urls_login', templateVars);
  }

  const user = users[user_id];
  const templateVars = { user };

  res.render('urls_new', templateVars);
});

// GET /urls/:shortURL - render
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  // If user access to /urls/new without login
  if (!user_id) {
    const templateVars = { user: null, error: 'Please login first!' };
    return res.status(403).render('urls_login', templateVars);
  }
  // If user_id does not match the userID of URL
  if (urlDatabase[shortURL].userID !== user_id) {
    const urlDatabase = urlsForUser(user_id);
    const templateVars = { user, urls: urlDatabase, error: `You cannot access to this shortURL ${shortURL}!` };
    return res.status(403).render('urls_index', templateVars);
  }

  
  const templateVars = { shortURL, longURL, user };

  res.render('urls_show', templateVars);
});

// POST /urls/:shortURL - redirect to /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  const user_id = req.cookies.user_id;

  // Can edit the shortURL only under the correct(creator's) cookie
  if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[shortURL].longURL = longURL;
  }

  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:shortURL/delete - redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;

  // Can delete the shortURL only under the correct(creator's) cookie
  if (urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[shortURL];
  }

  res.redirect('/urls');
});

// GET /u/:shortURL - redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  // If the shortURL doesn't exist in database
  if (!longURL) {
    return res.status(404).send(`<html><body>The entered shortURL <b>${shortURL}</b> does not exist!</body></html>`);
  }
  
  res.redirect(longURL);
});

// POST /login - redirect to /urls
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // If either of email and password is empty
  if (!email || !password) {
    const templateVars = {  user: null, error: 'Cannot enter an empty email or password!'};
    return res.status(400).render('urls_login', templateVars);
  }

  const user = findUserByEmail(email);

  // If the email does not exist
  if (!user) {
    const templateVars = { user: null, error: 'Email is not registered!' };
    return res.status(403).render('urls_login', templateVars);
  }
  // If password is not correct
  if (!bcrypt.compareSync(password, user.password)) {
    const templateVars = { user: null, error: 'Incorrect password!' };
    return res.status(403).render('urls_login', templateVars);
  }

  res.cookie('user_id', user.id);

  res.redirect('/urls');
});

// GET /login - render
app.get('/login', (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, error: null };

  res.render('urls_login', templateVars);
});

// POST /logout - clear the cookie - redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/home');
});

// GET /register - render
app.get('/register', (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, error: null };

  res.render('urls_registration', templateVars);
});

// POST /register - set the cookie - add users object - redirect
app.post('/register', (req, res) => {
  const id = generateRandomString(4);

  const { email, password } = req.body;
  
  // If either of email and password is empty
  if (!email || !password) {
    const templateVars = {  user: null, error: 'Cannot enter an empty email or password!'};
    return res.status(400).render('urls_registration', templateVars);
  }
  // If the entered email has already existed
  if (findUserByEmail(email)) {
    const templateVars = {  user: null, error: 'Email has been registered!'};
    return res.status(400).render('urls_registration', templateVars);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, password: hashedPassword };

  const encryptedCookie = 
  res.cookie('user_id', id);

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});