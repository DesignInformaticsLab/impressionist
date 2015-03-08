var io = require('socket.io')();

io.sockets.on('connection', function(socket){
    socket.on('selection', function(sig){
        io.emit('selection', sig);
    });
});

module.exports = io;