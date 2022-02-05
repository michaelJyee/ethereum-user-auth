const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const ethUtil = require('ethereumjs-util');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = 3000;

/* SETUP EXPRESS */
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(express.json());
app.use(cookieParser());
app.use(session({secret: "very important secret"}));

const authenticatedUsers = {};
const users = {};

/* AUTHENTICATED USER MIDDLEWARE */
const isAuthenticated = (req, res, next) => {
  if(authenticatedUsers[req.session.id]){
    req.session.user = authenticatedUsers[req.session.id];
    next();
  }
  else res.redirect('./login');
};

/* API */
app.get('/api/user/:publicAddress/message', (req, res) => {
  const { publicAddress } = req.params;
  const user = users[publicAddress.toLowerCase()];

  if(!user) res.send(404);
  else{
    const message = _getMessage(user.nonce);
    res.json({ publicAddress, message });
  }
});

app.post('/api/authenticate', (req, res) => {
  const { publicAddress, signature } = req.body;
  const sessionId = req.session.id;
  const user = users[publicAddress.toLowerCase()];
  const message = _getMessage(user.nonce);

  const isValid = _isValidateSignature(publicAddress, message, signature);
  if(isValid){
    authenticatedUsers[sessionId] = { ...user.userData };
    res.status(200).send();
  }
  else res.status(400);
});

app.post('/api/user', (req, res) => {
  const { publicAddress, userData } = req.body;
  const newUser = {
    publicAddress,
    userData,
    nonce: Math.floor(Math.random() * 1000000)
  };

  if(!newUser?.publicAddress) res.send(400);
  else{
    users[publicAddress.toLowerCase()] = newUser;
    res.status(200).send();
  }
});


/**
 * Creates Message For Client To Sign
 */
function _getMessage(nonce){
  return "You are authenticating... This Authentication will NOT cost any gas.\n\n\nAuthorizationId:" + nonce;
}

/**
 * Validates Signature / Public Address 
 */
function _isValidateSignature(publicAddress, message, signature){
  const encodedMessage = ethUtil.hashPersonalMessage(Buffer.from(message));
  const sig = ethUtil.fromRpcSig(ethUtil.addHexPrefix(signature));
  const publicAddressKey = ethUtil.ecrecover(encodedMessage, sig.v, sig.r, sig.s);
  const addressBuffer = ethUtil.publicToAddress(publicAddressKey);
  const signatureDerivedPublicAddress = ethUtil.bufferToHex(addressBuffer);

  return (signatureDerivedPublicAddress.toLowerCase() === publicAddress.toLowerCase());
}

/* PAGES */
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', isAuthenticated, (req, res) => {
  delete authenticatedUsers[req.session.id]; /* REMOVE SESSION ID FROM AUTHENTICATED USERS */
  res.redirect('login');
});

app.get('/users_only_page', isAuthenticated, (req, res) => {
  const user = JSON.stringify(req.session.user);
  res.render('users_only_page', {user});
});

app.get('/*', (req, res) => {
  res.redirect('login');
});

app.listen(port, () => {
  console.log(`web server listening on PORT:${port}`)
});