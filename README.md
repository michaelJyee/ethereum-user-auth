# ethereum-user-auth
Example of authenticating user session with an Ethereum signature

#quick start


`$ npm install`

```
app.js

/* ADD YOUR PUBLIC ADDRESS */
const users = [{
  nonceValue: 69, // Any Random Number
  
  publicAddress: '', /* SET THIS TO YOUR PUBLIC ADDRESS TO TEST WITH */
  
  /* Add any user data you want inside this object */
  userData: {
    userName: 'Michael Yee'
  }
}];
```

`node app.js`




