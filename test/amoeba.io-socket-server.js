var assert = require("assert");
var Amoeba = require("amoeba.io");
var LocalClient = require("amoeba.io-local-client");
var SocketServer = require("../lib/amoeba.io-socket-server");
var ServerIO = require('socket.io');
var Socket = require('socket.io-client');


Auth = function() {};

Auth.prototype.login = function(data, callback) {
    if (data.login == "admin" && data.password == "pass") {
        callback(null, {
            "res": "login ok"
        });
    } else {
        callback({
            "res": "login fail"
        }, null);
    }

};

var port = "8090";

amoeba = new Amoeba();
amoeba.service("auth", new LocalClient(new Auth()));

io = new ServerIO();
io.listen(port).on('connection', function(socket) {
    amoeba.server(new SocketServer(socket));
});


describe('SocketServer', function() {

    beforeEach(function() {

    });


    var socket = new Socket('http://localhost:' + port, {
        forceNew: true,
        reconnection: false
    });

    socket.on('connect', function() {
        it('#invoke', function(done) {

            socket.on('result', function(response) {
                assert.equal(response.data.res, "login ok");
                done();
            });
            socket.emit('invoke', {
                id: "4",
                service: "auth",
                method: "login",
                data: {
                    login: "admin",
                    password: "pass"
                }
            });
        });
    });

});
