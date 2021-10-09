const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = { urls: urlDatabase };

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
  res.render('urls_new');
});

// GET /urls/:shortURL - render
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});