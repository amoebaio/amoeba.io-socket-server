var Chain = require('chaining-tool');
var ServerIO = require('socket.io');

SocketServer = function(amoeba, config) {

    io = new ServerIO();
    io.listen(config.port).on('connection', function(socket) {

        var func = function(data, event, path) {

            var context = {
                event: {
                    session: socket.id,
                    path: path,
                    event: event,
                    data: data
                }
            };
            var chain = new Chain(amoeba.path(path).handlers("before_event"));

            chain.start(context, function(context) {
                socket.emit("event", context.event);
            });

        };

        amoeba.on("*", "*", func);

        socket.on('disconnect', function(socket) {
            amoeba.removeListener("*:*", func);
        });

        socket.on('error', function() {
            console.log(arguments);
        });

        socket.on('invoke', function(request) {
            var id = null;
            if (typeof(request.id) != "undefined") {
                id = request.id;
            }

            try {
                var params = [];
                if (request.arguments) {
                    params = request.arguments.slice();
                }
                params.unshift(request.method);
                if (id !== null) {
                    params.push(function(err, result) {
                        socket.emit("result", {
                            id: id,
                            error: err,
                            result: result
                        });
                    });
                }

                var amoeb = amoeba.path(request.path);
                amoeb.invoke.apply(amoeb, params);
            } catch (e) {
                //Error here
                if (id !== null) {
                    socket.emit("result", {
                        id: id,
                        error: {
                            "message": e.message
                        },
                        result: null
                    });
                }
            }
        });
    });
};

module.exports = exports = SocketServer;
