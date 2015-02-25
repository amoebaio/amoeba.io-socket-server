SocketServer = function(socket) {
    this.socket = socket;
    var self = this;
    socket.on('invoke', function(request) {
        self.invoke(request);
    });
};

SocketServer.prototype.amoeba = function(amoeba) {
    this.amoeba = amoeba;
};

SocketServer.prototype.invoke = function(data) {
    var id = data.id;
    var self = this;
    try {
        this.amoeba.service(data.service).invoke(data.method, data.data, function(err, data) {
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
