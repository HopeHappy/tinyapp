const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Object to store URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send('Hello');
});

// GET /urls - render
app.get('/urls', (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };

  res.render('urls_index', templateVars);
});

// POST /urls - redirect to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

// GET /urls/new - render
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user };

  res.render('urls_new', templateVars);
});

// GET /urls/:shortURL - render
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { shortURL, longURL, user };

  res.render('urls_show', templateVars);
});

// POST /urls/:shortURL - redirect to /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:shortURL/delete - redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

// GET /u/:shortURL - redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  // If the shortURL doesn't exist in database
  if (!longURL) {
    return res.status(404).send(`<html><body>The entered shortURL <b>${shortURL}</b> does not exist!</body></html>`);
  }
  
  res.redirect(longURL);
});

// POST /login - redirect to /urls
app.post('/login', (req, res) => {
  res.redirect('/urls');
});

// POST /logout - clear the cookie - redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');
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
  const email = req.body.email;
  const password = req.body.password;
  
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

  users[id] = { id, email, password };

  res.cookie('user_id', id);

  res.redirect('/urls');
});

// GET /login - render
app.get('/login', (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, error: null };

  res.render('urls_login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});