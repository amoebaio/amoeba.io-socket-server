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

SocketServer.prototype.invoke = function(request) {
    var self = this;
    var id=null;
    if(typeof(request.id)!="undefined"){
        id = request.id;
    }
    
    try {
        this._amoeba.use(request.use).invoke(request.method, request.params, function(err, data) {
            if(id!==null){
                self.socket.emit("result", {
                    id: id,
                    err: err,
                    result: data
                });
            }
        });
    } catch (e) {
        if(id!==null){
            self.socket.emit("result", {
                id: id,
                err: {
                    "message": e.message
                },
                result: null
            });
        }
    }
};

module.exports = exports = SocketServer;
