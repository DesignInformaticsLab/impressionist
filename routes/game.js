/**
 * Created by Max Yi Ren on 3/10/2015.
 */
var io;
var gameSocket;
var playerReady;
var numOfObjects = 1;
var objectstring_set = ["obj/BMW 328/BMW328MP.js", "obj/Dino/Dino.js", "obj/fedora/fedora.js",
    "obj/Helmet/helmet.js", "obj/iPhone/iPhone.js", "obj/Lampost/LampPost.js", "obj/TeaPot/TeaPot.js",
    "obj/Princeton/381.js", "obj/Princeton/382.js", "obj/Princeton/383.js"];

var pg = require('pg');
var connection = process.env.DATABASE_URL || "postgres://postgres:54093960@localhost:5432/postgres";
//for local postgres server, and Heroku server

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    // Player Events
    gameSocket.on('createNewGame', createNewGame);
    gameSocket.on('joinGame', joinGame);
    gameSocket.on('broadcastGameID', broadcastGameID);
    gameSocket.on('checkAnswer', checkAnswer);
    gameSocket.on('selection', selection);
    gameSocket.on('playerReady', playerReady);
    gameSocket.on('playerQuit', playerQuit);
};

/* *******************************
 *                             *
 *       PLAYER FUNCTIONS        *
 *                             *
 ******************************* */

function createNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    gameSocket.join(thisGameId.toString());

    data.mySocketId = this.id;

    // Emit an event notifying the clients that the player has joined the room.
    io.sockets.in(thisGameId).emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id, objectID: objID});
};

/**
 * A player enters the game.
 * Attempt to connect them to the room with one person.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function joinGame(data) {
    //console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );

    // A reference to the player's Socket.IO socket object
    var sock = this;

    // Look for a room with one person.
    var roomsid = Object.keys(io.sockets.adapter.rooms);
    var roomid = '';
    var room, temp_room;
    if(roomsid != undefined){
        for(var i=0;i<roomsid.length;i++){
            roomid = roomsid[i];
            if(roomid.length==5){
                temp_room = io.sockets.adapter.rooms[roomid];
                if(Object.keys(temp_room).length<2){
                    room = temp_room;
                    break;
                }
            }
        }
    }

    // If find a room...
    if( room != null ){
        // attach the socket id to the data object.
 //update this number as the number of models increases
        var numOfObjects = objectstring_set.length;

        var objID = Math.floor(Math.random() * numOfObjects);

        data.objectstring_set = objectstring_set;
        data.objectID = objID;
        data.mySocketId = sock.id;


        //data.playerId = sock.id;
        //data.hostId = Object.keys(room)[0];

        data.gameId = roomid;


        // Join the room
        sock.join(roomid);
        sock.gameId = roomid; // assign room id to sock
        //console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );


        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(roomid).emit('playerJoinedRoom', data);

    } else {
        // If no room, create a new one.
        var thisGameId = ( Math.random() * 90000 +10000 ) | 0;

        // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
        //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

        // Join the Room and wait for the players
        sock.join(thisGameId.toString());
        sock.gameId = thisGameId; // assign room id to sock
        data.mySocketId = sock.id;

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(thisGameId).emit('newGameCreated', {gameId: thisGameId, mySocketId: sock.id});
    }
}

function broadcastGameID(data){
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('newGameId', {gameId: data});
}

function playerReady(data){

    var roomid = this.gameId;
    if (!playerReady[roomid]){
        playerReady[roomid] = true;
    }
    else {

        try {
            var numOfObjects = GAME.App.objectstring_set.length;
        } catch (e) {
            var numOfObjects = 1;
        }

        var objID = Math.floor(Math.random() * numOfObjects);

        playerReady[roomid] = false;
        io.sockets.in(roomid).emit('playerReady', {objectID: objID});
    }
}

// player selected meshes, emit to the other player
function selection(data) {
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('selection', data);
}

/**
 * check if the guess is correct, and also store the current status of the game.
 * @param data gameId
 */
function checkAnswer(data) {
    var roomid = this.gameId;
    if (data.correct){
        //data.obj = getObjData(data.played);
        io.sockets.in(roomid).emit('answerCorrect', data);
    }
    else{
        io.sockets.in(roomid).emit('answerWrong', data);
    }
}

function playerQuit(){
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('quitGame', data);
}

/*
 * Javascript implementation of Fisher-Yates shuffle algorithm
 * http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */
function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var objPool = [];