var io = require('socket.io')();

io.sockets.on('connection', function(socket){
    console.log('connected');
    socket.on('selection', function(sig){
        console.log('selection received...');
        io.emit('selection', sig);
        console.log('selection emitted...');
    });
});

module.exports = io;