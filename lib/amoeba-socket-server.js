var Chain = require('chaining-tool');
var ServerIO = require('socket.io');

SocketServer = function(amoeba, config) {

    io = new ServerIO();
    io.listen(config.port).on('connection', function(socket) {

        var func=function(data, event, path) {
            socket.emit("event", {
                path: path,
                event: event,
                data: data
            });
        };

        amoeba.on("*","*", func); 

        socket.on('disconnect', function(socket) {
            amoeba.off("*:*", func);
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
                var params = [request.method];
                if (request.params) {
                    params.push(request.params);
                }
                params.push(function(err, result) {
                    if (id !== null) {
                        socket.emit("result", {
                            id: id,
                            error: err,
                            result: result
                        });
                    }
                });

                var amoeb = amoeba.path(request.path);
                amoeb.invoke.apply(amoeb, params);
            } catch (e) {
                if (id !== null) {
                    socket.emit("result", {
                        id: id,
                        err: {
                            "message": e.message
                        },
                        result: null
                    });
                }
            }
        });

        // socket.on('on', function(request) {
        //     try {
        //         event = request.event + ":" + request.path;
        //         if (~events_list[socket.id].indexOf(event)) {
        //             events_list[socket.id].push(event);
        //         }
        //         if (request.id) {
        //             socket.emit('result', {
        //                 id: request.id,
        //                 error: null,
        //                 result: {
        //                     success: true
        //                 }
        //             });
        //         }
        //     } catch (e) {
        //         if (request.id) {
        //             socket.emit("result", {
        //                 id: request.id,
        //                 err: {
        //                     "message": e.message
        //                 },
        //                 result: null
        //             });
        //         }
        //     }
        // });

        // socket.on('off', function(request) {
        //     try {
        //         events_list[socket.id].splice(events_list[socket.id].indexOf(request.event + ":" + request.path), 1);
        //         if (request.id) {
        //             socket.emit('result', {
        //                 id: request.id,
        //                 error: null,
        //                 result: {
        //                     success: true
        //                 }
        //             });
        //         }
        //     } catch (e) {
        //         if (request.id) {
        //             socket.emit("result", {
        //                 id: request.id,
        //                 error: {
        //                     "message": e.message
        //                 },
        //                 result: null
        //             });
        //         }
        //     }
        // });
    });
};

module.exports = exports = SocketServer;
