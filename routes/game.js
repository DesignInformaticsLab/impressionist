/**
 * Created by Max Yi Ren on 3/10/2015.
 */
var io;
var gameSocket;
var playerReady;
var numOfObjects = 5;

var connection = "postgres://postgres:54093960@localhost:5432/postgres"; //for local postgres server
var connection_online = process.env.DATABASE_URL; //for online version

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
    gameSocket.on('nextRound', nextRound);
    gameSocket.on('checkAnswer', checkAnswer);
    gameSocket.on('selection', selection);
    gameSocket.on('playerReady', playerReady);
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
        var objID = 3;//Math.floor(Math.random() * numOfObjects);
        data.objectID = objID;
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

function playerReady(data){

    var roomid = this.gameId;
    if (!playerReady[roomid]){
        playerReady[roomid] = true;
    }
    else {

        var objID = Math.floor(Math.random() * numOfObjects);

        playerReady[roomid] = false;
        io.sockets.in(roomid).emit('playerReady', {objectID: objID});
    }
}

/**
 * A player answered correctly. Time for the next word.
 * @param data Sent from the client. Contains the current round and gameId (room)
 */
function nextRound(data) {
    //if(data.round < objPool.length ){
    //    // Send a new set of words back to the host and players.
    //    sendObj(data.round, data.gameId);
    //} else {
    //    // If the current round exceeds the number of words, send the 'gameOver' event.
    //    io.sockets.in(data.gameId).emit('gameOver',data);
    //}
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
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var game_id = req.body.game_id;
        var all_selected_id = req.body.all_selected_id;
        var duration = req.body.duration;
        var score = req.body.score;
        var guess = req.body.answer;
        var correct = req.body.correct;
        var round = req.body.round;
        var penalty = [];
        var insert_query = client.query('INSERT INTO impressionist_results_table (game_id, round, all_selected_id, duration,' +
            ' score, guess, correct, penalty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [game_id, round, all_selected_id, duration, score, guess, correct, penalty]);
        insert_query.on('err', handle_error.bind(this, err));
        insert_query.on('end', function(result){res.status(202).send("Accepted data");});
        done();
    });
    if (data.correct){
        //data.obj = getObjData(data.played);
        io.sockets.in(roomid).emit('answerCorrect', data);
    }
    else{
        io.sockets.in(roomid).emit('answerWrong', data);
    }
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