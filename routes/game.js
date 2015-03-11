/**
 * Created by Max Yi Ren on 3/10/2015.
 */
var io;
var gameSocket;

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

    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostCountdownFinished', hostStartGame);
    gameSocket.on('hostNextRound', hostNextRound);
    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerAnswer', playerAnswer);
    gameSocket.on('playerRestart', playerRestart);

    gameSocket.on('selection', selection);
};


/* *******************************
 *                             *
 *       HOST FUNCTIONS        *
 *                             *
 ******************************* */

/**
 * 'hostCreateNewGame' event occurred when no other player can be found.
 */
function hostCreateNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    gameSocket.join(thisGameId.toString());

    data.mySocketId = this.id;

    // Emit an event notifying the clients that the player has joined the room.
    io.sockets.in(thisGameId).emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});
};

/*
 * Found a player. Alert the host!
 * @param gameId The game ID / room ID
 */
function hostPrepareGame(gameId) {
    var sock = this;
    var data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    //console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit('beginNewGame', data);
}

/*
 * The Countdown has finished, and the game begins!
 * @param gameId The game ID / room ID
 */
function hostStartGame(gameId) {
    console.log('Game Started.');
    sendObj(0,gameId);
};

/**
 * A player answered correctly. Time for the next word.
 * @param data Sent from the client. Contains the current round and gameId (room)
 */
function hostNextRound(data) {
    if(data.round < objPool.length ){
        // Send a new set of words back to the host and players.
        sendObj(data.round, data.gameId);
    } else {
        // If the current round exceeds the number of words, send the 'gameOver' event.
        io.sockets.in(data.gameId).emit('gameOver',data);
    }
}

function selection(data) {
    var roomid = this.gameId;
    io.sockets.in(roomid).emit('selection', data);
}
/* *****************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */

/**
 * A player enters the game.
 * Attempt to connect them to the room with one person.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
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
        data.mySocketId = sock.id;
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

/**
 * A player has tapped a word in the word list.
 * @param data gameId
 */
function playerAnswer(data) {
    // console.log('Player ID: ' + data.playerId + ' answered a question with: ' + data.answer);

    //io.sockets.in(data.gameId).emit('hostCheckAnswer', data);
}

/**
 * The game is over, and a player has clicked a button to restart the game.
 * @param data
 */
function playerRestart(data) {
    // console.log('Player: ' + data.playerName + ' ready for new game.');

    // Emit the player's data back to the clients in the game room.
    //data.playerId = this.id;
    //io.sockets.in(data.gameId).emit('playerJoinedRoom',data);
}


function sendObj(objPoolIndex, gameId) {
    //var data = getWordData(objPoolIndex);
    //io.sockets.in(data.gameId).emit('newWordData', data);
}

/**
 * This function does all the work of getting a new words from the pile
 * and organizing the data to be sent back to the clients.
 *
 * @param i The index of the wordPool.
 * @returns {{round: *, word: *, answer: *, list: Array}}
 */
function getObjData(i){
    // Randomize the order of the available words.
    // The first element in the randomized array will be displayed on the host screen.
    // The second element will be hidden in a list of decoys as the correct answer
    //var objs = shuffle(objPool[i].objs);

    //// Randomize the order of the decoy words and choose the first 5
    //var decoys = shuffle(wordPool[i].decoys).slice(0,5);
    //
    //// Pick a random spot in the decoy list to put the correct answer
    //var rnd = Math.floor(Math.random() * 5);
    //decoys.splice(rnd, 0, words[1]);
    //
    //// Package the words into a single object.
    //var wordData = {
    //    round: i,
    //    word : words[0],   // Displayed Word
    //    answer : words[1], // Correct Answer
    //    list : decoys      // Word list for player (decoys and answer)
    //};
    //
    //return wordData;
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