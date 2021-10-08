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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET /urls - render
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// POST /urls - redirect
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});