Add a config.js like this:

```javascript
module.exports = {
  eventstore: 'tcp://localhost:1113',

  host: 'http://ydalar.xn--hksgrd-juac2m.se:3000',

  oidcProviders: {
    google: {
      issuer:        'https://accounts.google.com',
      client_id:     'get your',
      client_secret: 'own',
    },
  },
}
```
