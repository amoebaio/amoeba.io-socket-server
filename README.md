#Socket server for amoeba.io
See also https://github.com/amoebaio/amoeba.io-socket-client

##Installation
```
npm install amoeba.io-socket-server
```

##Usage
```javascript
amoeba = new Amoeba();
amoeba.path("auth").as(...);

new SocketServer(amoeba, {
    "port": 8090
});
```