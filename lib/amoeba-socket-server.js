var Chain = require('chaining-tool');

SocketServer = function(socket) {
    this._amoeba = null;
    this.socket = socket;
    this.listenersFunc = {};
    var self = this;

    socket.on('invoke', function(request) {
        self.invoke(request);
    });

    //add listener
    socket.on('al', function(request) {
        try {
            var func = function(data) {

                var context = {
                    event: {
                        use: request.use,
                        event: request.event,
                        data: data
                    }
                };
                var chain_bofore = new Chain(self._amoeba.use(request.use).handlers("before_event"));

                chain_bofore.start(context, function(context) {
                    self.socket.emit("event", context.event);
                });
            };
            self._amoeba.use(request.use).on(request.event, func);
            self.listenersFunc[request.use + '.' + request.event] = func;
            if (request.id) {
                self.socket.emit('result', {
                    id: request.id,
                    err: null,
                    data: {
                        success: true
                    }
                });
            }
        } catch (e) {
            if (request.id) {
                self.socket.emit("result", {
                    id: request.id,
                    err: {
                        "message": e.message
                    },
                    data: null
                });
            }
        }
    });
    //remove listener
    socket.on('rl', function(request) {
        try {
            self._amoeba.use(request.use).removeListener(request.event, self.listenersFunc[request.use + '.' + request.event]);
            delete self.listenersFunc[request.use + '.' + request.event];
            if (request.id) {
                self.socket.emit('result', {
                    id: request.id,
                    err: null,
                    data: {
                        success: true
                    }
                });
            }
        } catch (e) {
            if (request.id) {
                self.socket.emit("result", {
                    id: request.id,
                    err: {
                        "message": e.message
                    },
                    data: null
                });
            }
        }
    });

};

SocketServer.prototype.amoeba = function(amoeba) {
    this._amoeba = amoeba;
};

SocketServer.prototype.invoke = function(data) {

    var id = data.id;
    var self = this;
    try {
        this._amoeba.use(data.use).invoke(data.method, data.data, function(err, data) {
            self.socket.emit("result", {
                id: id,
                err: err,
                data: data
            });
        });
    } catch (e) {
        self.socket.emit("result", {
            id: id,
            err: {
                "message": e.message
            },
            data: null
        });
    }
};

module.exports = exports = SocketServer;
