var io = require('socket.io')();
var game = require('./routes/game');

io.sockets.on('connection', function(socket){
    console.log('connected');
    game.initGame(io, socket);
    socket.on('disconnect', function() {
        var roomid = socket.gameId;
        io.sockets.in(roomid).emit('playerLeft', {gameId: roomid, mySocketId: socket.id});
    });
});

module.exports = io;