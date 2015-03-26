var assert = require("assert");
var Amoeba = require("amoeba.io");
var LocalClient = require("amoeba.io-local-client");
var SocketServer = require("../lib/amoeba-socket-server");
var ServerIO = require('socket.io');
var Socket = require('socket.io-client');

var tester = 0;

var port = "8090";
Auth = function() {};
Auth.prototype.method1 = function() {
    tester = 1;
};

Auth.prototype.method2 = function(callback) {
    callback(null, "ok");
};

Auth.prototype.method3 = function(param) {
    tester = param.set;
};
Auth.prototype.method4 = function(param1, param2, param3) {
    tester = param1 + param2 + param3;
};
Auth.prototype.method5 = function(param, callback) {
    callback(null, param.set);
};
Auth.prototype.method6 = function(param1, param2, param3, callback) {
    callback(null, param1 + param2 + param3);
};
Auth.prototype.login = function(login, password, callback) {
    if (login == "admin" && password == "pass") {
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
    socket.on('error', function() {
        //error received on SocketServer
    });
    amoeba.server(new SocketServer(socket));
});

describe('SocketServer', function() {

    beforeEach(function() {
        tester = 0;
    });
    it('#invoke empty method', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.ok(false);
            });
            socket.emit('invoke', {
                use: "auth",
                method: "method1"
            });
            setTimeout(function() {
                assert.equal(tester, 1);
                done();
            }, 100);

        });
    });

    it('#invoke empty method with callback', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.equal(response.result, "ok");
                done();
            });
            socket.emit('invoke', {
                id: 4,
                use: "auth",
                method: "method2"
            });
        });
    });

    it('#invoke param method without callback', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.ok(false);
            });
            socket.emit('invoke', {
                use: "auth",
                method: "method3",
                params: {
                    set: 5
                }
            });
            setTimeout(function() {
                assert.equal(tester, 5);
                done();
            }, 100);

        });
    });

    it('#invoke params method without callback', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.ok(false);
            });
            socket.emit('invoke', {
                use: "auth",
                method: "method4",
                params: [1, 2, 3]
            });
            setTimeout(function() {
                assert.equal(tester, 6);
                done();
            }, 100);

        });
    });

    it('#invoke param method with callback', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.equal(response.result, 5);
                done();
            });
            socket.emit('invoke', {
                id: 4,
                use: "auth",
                method: "method5",
                params: {
                    "set": 5
                }
            });
        });
    });
    it('#invoke params method with callback', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.equal(response.result, 6);
                done();
            });
            socket.emit('invoke', {
                id: 4,
                use: "auth",
                method: "method6",
                params: [1, 2, 3]
            });
        });
    });
    it('#invoke', function(done) {
        var socket = new Socket('http://localhost:' + port, {
            forceNew: true,
            reconnection: false
        });
        socket.on('connect', function() {
            socket.on('result', function(response) {
                assert.equal(response.result.res, "login ok");
                done();
            });
            socket.emit('invoke', {
                id: "4",
                use: "auth",
                method: "login",
                params: ["admin", "pass"]
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
                assert.ok(response.err.message !== null);
                done();
            });

            socket.emit('invoke', {
                id: "4",
                use: "auths",
                method: "login",
                params: {
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
                params: {
                    login: "admin",
                    password: "pass"
                }
            });
        });
    });
});
