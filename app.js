const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const ethUtil = require('ethereumjs-util');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = 3000;

const users = [{
  nonceValue: 69,            /* Random Number */
  publicAddress: '',         /* User's Ethereum Public Address */
  userData: {                /* User Information */
    userName: 'Michael Yee'
  }
}];

const authenticatedUsers = {};

app.set('view engine', 'pug');
app.use(express.json());
app.use(cookieParser());
app.use(session({secret: "very important secret"}));

app.get('/', (req, res) => {
  const sessionId = req.session.id;

  res.render('home');
});

/* User API */
app.get('/api/user/:publicAddress/nonce', (req, res) => {
  const { publicAddress } = req.params;
  const user = users.find(user => user.publicAddress === publicAddress);

  if(!user) res.send(404);
  else res.json({ publicAddress, nonce: user.nonceValue });
});

app.post('/api/authenticate', (req, res) => {
  const { publicAddress, signature } = req.body;
  const sessionId = req.session.id;

  const user = users.find(user => user.publicAddress === publicAddress);
  const nonce = "" + user.nonceValue;

  const encodedNonce = ethUtil.hashPersonalMessage(Buffer.from(nonce));
  const sig = ethUtil.fromRpcSig(ethUtil.addHexPrefix(signature));
  const publicAddressKey = ethUtil.ecrecover(encodedNonce, sig.v, sig.r, sig.s);
  const addressBuffer = ethUtil.publicToAddress(publicAddressKey);
  const signatureDerivedPublicAddress = ethUtil.bufferToHex(addressBuffer);

  if(signatureDerivedPublicAddress.toLowerCase() === publicAddress.toLowerCase()){
    authenticatedUsers[sessionId] = { ...user.userData };
    res.send();
  }
});

app.listen(port, () => {
  console.log(`web server listening on PORT:${port}`)
});