const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send('Hello');
});

// GET /urls - render
app.get('/urls', (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username, urls: urlDatabase };

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
  const username = req.cookies.username;
  const templateVars = { username };

  res.render('urls_new', templateVars);
});

// GET /urls/:shortURL - render
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies.username;
  const templateVars = { shortURL, longURL, username };

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

// POST /login - set the cookie - redirect to /urls
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);

  res.redirect('/urls');
});

// POST /logout - clear the cookie - redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});