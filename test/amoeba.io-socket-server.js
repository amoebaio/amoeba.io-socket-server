var assert = require("assert");
var Amoeba = require("amoeba.io");
var LocalClient = require("amoeba.io-local-client");
var SocketServer = require("../lib/amoeba-socket-server");
var ServerIO = require('socket.io');
var Socket = require('socket.io-client');

var port = "8090";
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
amoeba.use("auth", new LocalClient(new Auth()));

io = new ServerIO();
io.listen(port).on('connection', function(socket) {
    socket.on('error', function(){
        //error received on SocketServer
    });
    amoeba.server(new SocketServer(socket));
});

describe('SocketServer', function() {

    beforeEach(function() {

    });

    it('#invoke', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {


            socket.on('result', function(response) {
                assert.equal(response.data.res, "login ok");
                done();
            });
            socket.emit('invoke', {
                id: "4",
                use: "auth",
                method: "login",
                data: {
                    login: "admin",
                    password: "pass"
                }
            });
        });
    });


    it('#invoke unknown use', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });

        socket.on('connect', function() {

            socket.on('result', function(response) {
                assert.ok(response.err.message!==null);
                done();
            });

            socket.emit('invoke', {
                id: "4",
                use: "auths",
                method: "login",
                data: {
                    login: "admin",
                    password: "pass"
                }
            });
        });
    });

    it('#invoke unknown method', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });

        socket.on('connect', function() {

            socket.on('result', function(response) {
                assert.equal(response.err.message, "Object 'auth' has no method 'logins'");
                done();
            });

            socket.emit('invoke', {
                id: "4",
                use: "auth",
                method: "logins",
                data: {
                    login: "admin",
                    password: "pass"
                }
            });
        });
    });
});
