const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(express.static('public'));
app.use(cookieSession({
  name:'session',
  keys: ['secretKey']
}));

// Object to store URLs
const urlDatabases = {
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

// GET /home - render
app.get("/home", (req, res) => {
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user };

  res.render('urls_home', templateVars);
});

// GET /urls - render
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;

  // If user access to /urls/new without login
  if (!user_id) {
    const templateVars = { user: null, error: 'Please login first!' };
    return res.status(403).render('urls_login', templateVars);
  }

  const urlDatabase = urlsForUser(user_id, urlDatabases);
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase, error: null };

  res.render('urls_index', templateVars);
});

// POST /urls - redirect to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  const userID = req.session.user_id;
  // const userID = req.cookies.user_id;
  urlDatabases[shortURL] = { longURL, userID };
  
  res.redirect(`/urls/${shortURL}`);
});

// GET /urls/new - render
app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;

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

// Stretch - Analytics
const visits = {};
const { uniqueVisits } = require('./helpers');

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabases[shortURL].longURL;
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;
  const user = users[user_id];

  // If user access to /urls/new without login
  if (!user_id) {
    const templateVars = { user: null, error: 'Please login first!' };
    return res.status(403).render('urls_login', templateVars);
  }
  // If user_id does not match the userID of URL
  if (urlDatabases[shortURL].userID !== user_id) {
    const urlDatabase = urlsForUser(user_id, urlDatabases);
    const templateVars = { user, urls: urlDatabase, error: `You cannot access to this shortURL ${shortURL}!` };
    return res.status(403).render('urls_index', templateVars);
  }

  // Stretch - Analytics
  // Login page the first time
  if (!visits[shortURL]) {
    visits[shortURL] = [];
  }

  const records = visits[shortURL];
  const totalVisits = records.length;
  const totalUniqueVisits = uniqueVisits(records);

  const templateVars = { shortURL, longURL, user, totalVisits, totalUniqueVisits, records };

  res.render('urls_show', templateVars);
});

// POST /urls/:shortURL - redirect to /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // If the longURL does not begin with http:, add it at the beginning
  const longURL = req.body.longURL.substring(0, 5) === 'http:' ? req.body.longURL : `http://${req.body.longURL}`;
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;

  // Can edit the shortURL only under the correct(creator's) cookie
  if (urlDatabases[shortURL].userID === user_id) {
    urlDatabases[shortURL].longURL = longURL;
  }

  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:shortURL/delete - redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;

  // Can delete the shortURL only under the correct(creator's) cookie
  if (urlDatabases[shortURL].userID === user_id) {
    delete urlDatabases[shortURL];
  }

  res.redirect('/urls');
});

// GET /u/:shortURL - redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabases[shortURL].longURL;
  // If the shortURL doesn't exist in database
  if (!longURL) {
    return res.status(404).send(`<html><body>The entered shortURL <b>${shortURL}</b> does not exist!</body></html>`);
  }

  // Stretch - Analytics
  // Set cookie value as the visitID
  let visitId = req.session.user_id;
  // Set 'Unknown User' as the visitID when users are not logged in
  if (!visitId) {
    visitId = 'Unknown User';
  }
  const time = new Date().toUTCString();
  visits[shortURL].push({ visitId, time });

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

  const user = getUserByEmail(email, users);

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

  req.session.user_id = user.id;
  // res.cookie('user_id', user.id);

  res.redirect('/urls');
});

// GET /login - render
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, error: null };

  res.render('urls_login', templateVars);
});

// POST /logout - clear the cookie - redirect to /urls
app.post('/logout', (req, res) => {
  req.session = null;
  // res.clearCookie('user_id');

  res.redirect('/home');
});

// GET /register - render
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  // const user_id = req.cookies.user_id;
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
  if (getUserByEmail(email, users)) {
    const templateVars = {  user: null, error: 'Email has been registered!'};
    return res.status(400).render('urls_registration', templateVars);
  }

  // Use bcrypt to generate hashed password
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, password: hashedPassword };

  // Use cookie-session to generate encrypted cookie
  req.session.user_id = id;
  // res.cookie('user_id', id);

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});