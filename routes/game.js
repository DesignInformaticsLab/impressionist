/**
 * Created by Max Yi Ren on 3/10/2015.
 */
var io;
var gameSocket;
var playerReady = []; // room key
var score = 0; // real-time score to be shared between the two players

var objectstring_set = [
    "obj/Princeton/0.js","obj/Princeton/2.js","obj/Princeton/5.js","obj/Princeton/10.js",
    "obj/Princeton/15.js","obj/Princeton/20.js","obj/Princeton/25.js","obj/Princeton/40.js","obj/Princeton/45.js",
    "obj/Princeton/55.js","obj/Princeton/60.js","obj/Princeton/65.js","obj/Princeton/80.js","obj/Princeton/85.js",
    "obj/Princeton/90.js","obj/Princeton/95.js","obj/Princeton/105.js","obj/Princeton/110.js","obj/Princeton/115.js",
    "obj/Princeton/200.js","obj/Princeton/201.js","obj/Princeton/206.js", "obj/Princeton/269.js", "obj/Princeton/281.js",

    "obj/Princeton/285.js","obj/Princeton/299.js",  "obj/Princeton/381.js","obj/Princeton/382.js",
    "obj/Princeton/383.js","obj/Princeton/384.js","obj/Princeton/385.js","obj/Princeton/386.js","obj/Princeton/387.js",
    "obj/Princeton/388.js","obj/Princeton/389.js","obj/Princeton/390.js","obj/Princeton/391.js","obj/Princeton/392.js",
    "obj/Princeton/393.js","obj/Princeton/394.js","obj/Princeton/395.js","obj/Princeton/396.js","obj/Princeton/397.js",
    "obj/Princeton/398.js","obj/Princeton/400.js","obj/Princeton/430.js","obj/Princeton/485.js","obj/Princeton/490.js",

    "obj/Princeton/495.js", "obj/Princeton/560.js","obj/Princeton/575.js",
    "obj/Princeton/585.js","obj/Princeton/590.js","obj/Princeton/595.js","obj/Princeton/600.js","obj/Princeton/605.js",
    "obj/Princeton/615.js","obj/Princeton/630.js","obj/Princeton/645.js","obj/Princeton/650.js","obj/Princeton/670.js",
    "obj/Princeton/705.js","obj/Princeton/720.js","obj/Princeton/725.js","obj/Princeton/735.js","obj/Princeton/775.js",

    "obj/Princeton/785.js","obj/Princeton/795.js","obj/Princeton/870.js",
    "obj/Princeton/945.js","obj/Princeton/980.js","obj/Princeton/985.js","obj/Princeton/995.js","obj/Princeton/1085.js",
    "obj/Princeton/1095.js","obj/Princeton/1105.js","obj/Princeton/1125.js"
]; //["obj/BMW 328/BMW328MP.js", "obj/Dino/Dino.js", "obj/fedora/fedora.js",
//    "obj/Helmet/helmet.js", "obj/iPhone/iPhone.js", "obj/Lampost/LampPost.js", "obj/TeaPot/TeaPot.js",
//    "obj/Princeton/381.js", "obj/Princeton/382.js", "obj/Princeton/383.js"];

var pg = require('pg');
var connection = process.env.DATABASE_URL || "postgres://postgres:54093960@localhost:5432/postgres"
    || "postgres://postgres:GWC464doi@localhost:5432/postgres";
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
    gameSocket.on('playerReady', onPlayerReady);
    gameSocket.on('playerQuit', playerQuit);
    gameSocket.on('getSocketStats', getSocketStats);
    gameSocket.on('grabBestObject', grabBestObject);
    gameSocket.on('synchronizeScore', synchronizeScore);
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
function joinGame() {
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
        var data = {};
        var objID = Math.floor(Math.random() * numOfObjects);

    var objID = Math.floor(Math.random() * numOfObjects);
    // var objID =  4; // up to numOfObjects

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

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(thisGameId).emit('newGameCreated', {gameId: thisGameId, mySocketId: sock.id});
    }
}

function broadcastGameID(data){
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('newGameId', {gameId: data});
}

function onPlayerReady(data){

    var roomid = this.gameId;
    if (!playerReady[roomid]){
        playerReady[roomid] = true;
    }
    else {

        try {
            var numOfObjects = objectstring_set.length;
        } catch (e) {
            var numOfObjects = 1;
        }

        var objID = Math.floor(Math.random() * numOfObjects);

        playerReady[roomid] = false;
        io.sockets.in(roomid).emit('playerReady', {objectID: objID});
    }
}

// during human-computer games, grab an object that requires validation
function grabBestObject(){
    // TODO: read from database
    //var numOfObjects = objectstring_set.length;
    //var objID = Math.floor(Math.random() * numOfObjects);
    var objID = 40; //the 383 th model
    this.emit('objectGrabbed', {objectAdd: objectstring_set[objID]});
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
    if (roomid){
        io.sockets.in(roomid).emit('quitGame');
        //var sock = this;

        // once a player quits, all quit
        var room = io.sockets.adapter.rooms[roomid];
        if (typeof(room)!='undefined'){
            var ids = Object.keys(room);
            for (var s = 0; s<ids.length; s++) {
                io.sockets.connected[ids[s]].leave(roomid);
            }
        }
    }
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

/**
 * get current socket status
 */
function getSocketStats(){
    var roomsid = Object.keys(io.sockets.adapter.rooms);
    var count = 0;
    if(roomsid != undefined){
        for(var i=0;i<roomsid.length;i++){
            if(roomsid[i].length!=5){// length==5 is defined for room id, length>5 are for player id
                count+=1;
            }
        }
    }
    this.emit('updateSocketStats', {'numPlayer':count});
    //io.sockets.emit('updateSocketStats', {'numPlayer':count});
}

function synchronizeScore(data){
    var s = data;
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('updateScore', {'score':s});
    //if (score==0){
    //    score = s;
    //}
    //else {
    //    score = Math.max(score, s);
    //    io.sockets.in(roomid).emit('updateScore', {'score':score});
    //    score = 0;
    //}
}