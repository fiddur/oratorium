Add a config.js like this:

```javascript
module.exports = {
  eventstore: 'tcp://localhost:1113',

  host: 'http://ydalar.xn--hksgrd-juac2m.se:3000',

  oidcProviders: {
    google: {
      title:         'Google',
      icon:          'https://upload.wikimedia.org/wikipedia/commons/4/4d/Google_Icon.svg',
      issuer:        'https://accounts.google.com',
      client_id:     'get your',
      client_secret: 'own',
    },
  },
}
```

Run the eventstore:

`docker run --name esdb-node -it -p 2113:2113 -p 1113:1113 eventstore/eventstore:latest --insecure`
