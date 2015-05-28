/**
 * Created by Max Yi Ren on 3/7/2015.
 */

var GAME = (function($){
    'use strict';
    var game = {};
    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {
        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },
        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('playerLeft',IO.playerLeft );
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('newObjData', IO.onNewObjData);
            IO.socket.on('answerCorrect', IO.onAnswerCorrect);
            IO.socket.on('answerWrong', IO.onAnswerWrong);
            IO.socket.on('gameOver', IO.gameOver);
            IO.socket.on('error', IO.error );
            IO.socket.on('selection', IO.onSelection); // when faces are selected
            IO.socket.on('playerReady', IO.onPlayerReady); // when faces are selected
        },

        /**
         * The client is successfully connected!
         */
        onConnected : function() {
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = IO.socket.id;
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        onNewGameCreated : function(data) {
            App.myRole = 'Host';

            // this should be randomly chosen from the server


            console.log('my id:'+data.mySocketId);
        },

        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom : function(data) {
            console.log('player '+ data.mySocketId +  ' joined room #' + data.gameId);

            var possibleObjects = ["obj/Dino/Dino.js","obj/fedora/fedora.js","obj/iPhone/iPhone.js","obj/BMW 328/BMW328MP.js","obj/Helmet/Helmet.js"]; //if this becomes longer also update the length at /routes/games.js LN:44;
            App.objectString = possibleObjects[data.objectID];

            App.$wait.hide();
            App.$game.show();
            App.totalTime = 5; // total game time is 5 min
            // create a new object and start the game
            IO.onNewObjData();
        },

        playerLeft: function(data){
            App.$wait.show();
            App.$game.hide();
            App.$model.html('');
            App.myRole = 'Host';
            console.log('player '+ data.mySocketId +  ' left room #' + data.gameId);
            IO.gameOver();
        },

        // on player selection: combined the two codes together, not sure why we had two...
        onSelection: function(sig){
            //if(object != undefined){ // if model exists
            //    var selections = JSON.parse(sig);
            //    var childnumber = selections.shift();
            //    for (var i = 0 ; i < selections.length; i++ ) {
            //        if((App.myRole=='Host')){
            //            //object.children[childnumber].geometry.faces[selections[i]].color.setHex(0xff0000);
            //        }
            //        else{ // if player
            //            object.children[childnumber].geometry.faces[selections[i]].color = 0xffffff;
            //        }
            //        object.children[childnumber].geometry.faces[selections[i]].selected = true;
            //    }
            //    object.children[childnumber].geometry.colorsNeedUpdate = true;
            //    selections.unshift(childnumber);
            //}
            if(Obj.object != undefined) { // if model exists
                var selections = JSON.parse(sig);
                var childnumber = selections.shift();
                if (App.myRole == 'Player') {
                    // create meshes on fly

                    Obj.createMesh(selections, childnumber);
                    // update selection capacity
                    App.selection_capacity = App.selection_capacity - selections.length;
                    App.$bar.css('opacity', App.selection_capacity / 1000 * App.progressbar_size);
                    App.$bar.css('background-color', '#333333');
                }
                else if (App.myRole == 'Host') {
                    $.each(selections, function(id,i){
                        Obj.object.children[childnumber].geometry.faces[i].color.setHex(0xff7777);
                    });
                    Obj.scene.children[0].children[childnumber].geometry.colorsNeedUpdate = true;
                }
            }
        },

        // on correct guess
        onAnswerCorrect : function() {
            App.$guessinput.css('background-color', '#ffffff');
            App.$guessinput.html('You got it!'); // show something when correct
            setTimeout(function () {
                App.$guessinput.css('background-color', '#f5f5ff');
                App.$guessinput.html(''); // clean input area
                App.score += 1; // this needs to change depending on the difficulty of the object
                App.currentRound += 1;
                App.$score.html(App.score); // update score
                App.$guessoutput.html(''); // clean output area

                App.$game.hide();
                App.$continue.show();
                //IO.onNewObjData(); // get a new object and start a new round
            },800);
        },

        // on wrong guess
        onAnswerWrong : function(data) {
            if(App.myRole == 'Host'){
                App.$guessoutput.html(data.answer+'?');
            }
            else if (App.myRole == 'Player'){
                App.$guessinput.css('background-color', '#000000');
                setTimeout(function () {
                    App.$guessinput.css('background-color', '#f5f5ff');
                },800);
            }
        },

        /**
         * When the other player is ready
         * @param data
         */
        onPlayerReady : function(data) {
            // switch role
            if(App.myRole == 'Host'){
                App.myRole = 'Player';
            }
            else{
                App.myRole = 'Host';
            }
            App.$wait.hide();
            App.$game.show();
            IO.onNewObjData();
        },

        /**
         * A new obj for the round is returned from the server.
         * @param data
         */
        onNewObjData : function(data) {
            $.getScript( App.objectString, function() {
                console.log( "New object loaded." );
                // reset game
                App.Host.selection_capacity = 10000; // assign player selection capacity for current obj
                Obj.correct_answer = answer; // get correct answers
                Obj.height = zheight;
                Obj.scale = scale;

                App.$model.html('');
                if(App.myRole == 'Host'){
                    App.$menu.show();
                    App.$guessoutput.show();
                    App.$guessoutput[0].value='';
                    App.$guessinput.hide();
                }
                else{
                    App.$menu.show();
                    App.$guessoutput.hide();
                    App.$guessinput.show();
                    App.$guessinput[0].value='';
                }
                App.$model.focus(); // focus on $model so that key events can work

                App.currentTime = Date.now();
                Obj.init();
                Obj.animate();
                Obj.object.rotation.y = Math.random()*Math.PI*2;
                console.log('rotation:');
                console.log(GAME.Obj.object.rotation.y );
            });
        },

        /**
         * Let everyone know the game has ended.
         * @param data
         */
        gameOver : function() {
            //App[App.myRole].endGame(data);

        },

        /**
         * An error has occurred.
         * @param data
         */
        error : function(data) {
            alert(data.message);
        }
    };

    var App = {
        /**
         * Use VR mode or not
         */
        VRMODE: false,

        /**
         * This is used to differentiate between 'Host' and 'Player' browsers.
         */
        myRole: 'Player',   // 'Host' shows the obj, 'Player' guesses

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        /**
         * Identifies the current round.
         */
        currentRound: 0,

        /**
         * current score
         */
        score: 0,

        /**
         * mouse location
         */
        mouse: [],

        /**
         * if mouse left button is down
         */
        PRESSED: false,



        /* *************************************
         *                Setup                *
         * *********************************** */
        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.cacheElements();
            App.bindEvents();
            App.showInitScreen();
            // Initialize the fastclick library
            //FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);
            App.$wait = $('#wait');
            App.$game = $('#game');
            App.$model = $('#model');
            App.$score = $('#score');
            App.$guessoutput = $('#guessoutput');
            App.$guessinput = $('#guessinput');
            App.$menu = $('#menu');
            App.$bar = $('#bar');
            App.$select = $('#select');
            App.$time = $('#time');
            App.$timebar = $('#timebar');
            App.$entry = $('#entry');
            App.$home = $('#home');
            App.$wait = $('#wait');
            App.$continue = $('#continue');
            App.$continue_btn = $('#continue_btn');

            // interface
            //var game_height = $(window).height() - $('.mastfoot').height() - $('.masthead').height();
            var margin_left = (App.$game.width()-App.$select.width()-App.$guessinput.width()
                -App.$time.width()-App.$score.width()-30)*.5;
            var menu_bottom = $('.mastfoot').height();
            App.$menu.css('bottom',menu_bottom);
            //App.$game.height(game_height);
            App.$time.css('marginLeft',margin_left+'px');
            App.$timebar.css('marginLeft',margin_left+'px');
            App.$score.css('marginLeft',margin_left+10+App.$time.width()+'px');
            App.$select.css('marginLeft',margin_left+20+App.$time.width()+App.$score.width()+'px');
            App.$bar.css('marginLeft',margin_left+20+App.$time.width()+App.$score.width()+'px');
            App.$guessoutput.css('marginLeft',margin_left+30+App.$select.width()
                +App.$time.width()+App.$score.width()+'px');
            App.$guessinput.css('left',margin_left+30+App.$select.width()
                +App.$time.width()+App.$score.width()+'px');
            App.progressbar_size = App.$select.css('opacity')/1;
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host and Player
            App.$model.mousemove(function(e){App.onMouseMove(e)});
            App.$model.mousedown(function(e){App.onMouseDown(e)});
            App.$model.mouseup(function(e){App.onMouseUp(e)});
            App.$model.keyup(function(e){App.onKeyUp(e)});
            App.$model.keydown(function(e){App.onKeyDown(e)});
            window.addEventListener( 'resize', App.onWindowResize, false );

            // Host

            // Player
            App.$guessinput.on('keypress', App.Host.onGuessinputKeyPress);
            App.$entry.click(function(){
                App.$home.hide();
                App.$wait.show();
                App.Player.onJoinClick();
            });
            App.$continue_btn.click(function(){
                App.$continue.hide();
                App.$wait.show();
                IO.socket.emit('playerReady');
            });

        },

        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            //App.$gameArea.html(App.$templateIntroScreen);
            //App.doTextFit('.title');
        },



        onWindowResize: function() {
            // interface
            //var game_height = $(window).height() - $('.mastfoot').height() - $('.masthead').height();
            var margin_left = (App.$game.width()-App.$select.width()-App.$guessinput.width()
                -App.$time.width()-App.$score.width()-30)*.5;
            var menu_bottom = $('.mastfoot').height();
            App.$menu.css('bottom',menu_bottom);
            //App.$game.height(game_height);
            App.$time.css('marginLeft',margin_left+'px');
            App.$timebar.css('marginLeft',margin_left+'px');
            App.$score.css('marginLeft',margin_left+10+App.$time.width()+'px');
            App.$select.css('marginLeft',margin_left+20+App.$time.width()+App.$score.width()+'px');
            App.$bar.css('marginLeft',margin_left+20+App.$time.width()+App.$score.width()+'px');
            App.$guessoutput.css('marginLeft',margin_left+30+App.$select.width()
                +App.$time.width()+App.$score.width()+'px');
            App.$guessinput.css('left',margin_left+30+App.$select.width()
                +App.$time.width()+App.$score.width()+'px');
            App.progressbar_size = App.$select.css('opacity')/1;

            Obj.camera.aspect = App.$model.width() / App.$model.height();
            Obj.camera.updateProjectionMatrix();

            /* if (VRMODE) {
             Obj.vrEffect.setSize(window.innerWidth, window.innerHeight);
             }
             else {*/
            Obj.renderer.setSize(App.$model.width(), App.$model.height());
            //}
        },

        /**
         * when mouse move, change view and do select() when SELECT is true
         * @param e: mouse event
         */
        onMouseMove: function (e) {
            e.preventDefault();
            var tempx = App.mouse.x;
            var tempy = App.mouse.y;
            App.mouse.x = ( e.clientX / App.$model.width()) * 2 - 1;
            App.mouse.y = - ( e.clientY / App.$model.height() ) * 2 + 1;
            if (App.PRESSED == true){
                if (App.Host.SELECT == true) {
                    App.Host.select();
                }
                else {
                    Obj.theta = (App.mouse.x - tempx)*4.0;
                    Obj.beta = (App.mouse.y-tempy)*2.0;
                }
            }
        },

        onMouseDown: function (e) {
            e.preventDefault();
            if (!App.isJqmGhostClick(event)) {
                App.PRESSED = true;
                if (App.PRESSED == true && App.Host.SELECT == true) {
                    App.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
                    App.mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
                    App.Host.select();

                }
            }
        },
        onMouseUp: function (e) {
            e.preventDefault();
            App.PRESSED = false;
            Obj.theta = 0;
            Obj.beta = 0;
        },

        /**
         * when key down: s: make selection, z: show heatmap (obsolete soon), u: upload heatmap (obsolete soon)
         * @param e: mouse event
         */
        onKeyDown: function (e) {
            e.preventDefault();
            if (e.keyCode == 83 && App.myRole =='Host'){ //s: selection
                App.Host.SELECT = true;
                App.$bar.addClass('active');
            } else if ( e.keyCode == 90 && App.myRole =='Host') { //z: show heatmap
                var weight = new Array(object.getObjectByName('selectable').geometry.faces.length);
                var mesh_id_array, weight_array;
                $.post('/read_selection',{'obj_id':object.name},function(response){
                        $.each(response, function(i,r){
                            mesh_id_array = r.mesh_id;
                            weight_array = r.weight;
                            $.each(mesh_id_array, function(j,mesh_id){
                                if(!weight[mesh_id]){
                                    weight[mesh_id] = weight_array[j];
                                }
                                else{
                                    weight[mesh_id] += weight_array[j];
                                }
                            })
                        });
                        var max_weight = Math.max.apply(Math,weight_array)
                        $.each(weight, function(i,w){
                            if(w){
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.r = Math.max(w/max_weight,0.7);
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.g = Math.max(w/max_weight/5,0.2);
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.b = Math.max(w/max_weight/5,0.2);
                            }
                            else{
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.r = 0.2;
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.g = 0.2;
                                Obj.object.getObjectByName("selectable").geometry.faces[i].color.b = 0.2;
                            }
                        });
                    }
                );
            } else if (e.keyCode == 85 && App.myRole =='Host'){ //u: upload selection
                var weight = [];
                $.each(allSelectedID, function(i,d){
                    weight.push(1-weight.length/allSelectedID.length);
                })
                $.post('/store_selection',{
                        'obj_id': Obj.object.name,
                        'mesh_id': JSON.stringify(allSelectedID),
                        'weight': JSON.stringify(weight)}
                );
            }
        },

        /**
         * when key up, end selecting
         * @param e: mouse event
         */
        onKeyUp: function (e) {
            //if (event.keyCode == 37) {
            //    //Left Arrow Key
            //    theta = 0;
            //} else if (event.keyCode == 38) {
            //    //Up Arrow Key
            //
            //} else if (event.keyCode == 39) {
            //    //Right Arrow Key
            //    theta = 0;
            //} else if (event.keyCode == 40) {
            //    //Down Arrow Key
            //
            //}
            e.preventDefault();
            if (e.keyCode == 83 && App.myRole =='Host' ){
                App.Host.SELECT = false;
                App.$bar.removeClass('active');
            }
        },




        /* *******************************
         *         HOST CODE           *
         ******************************* */
        Host : {

            /**
             * Flag to indicate if a new game is starting.
             * This is used after the first game ends, and players initiate a new game
             * without refreshing the browser windows.
             */
            isNewGame : false,

            /**
             * Keep track of the number of players that have joined the game.
             */
            numPlayersInRoom: 0,

            /**
             * Handler for the "Start" button on the Title Screen.
             */
            onCreateClick: function () {
                // console.log('Clicked "Create A Game"');
                IO.socket.emit('createNewGame');
            },

            /**
             * all selected face ID for the current object
             */
            allSelectedIDMaster: [],

            /**
             * current selected face ID
             */
            selectedStrings: [],

            /**
             * the maximum number of faces one can select, updated after the game starts
             */
            selection_capacity: 0,

            /**
             * if in the selection mode
             */
            SELECT: false,

            /**
             * check guess
             * @param e: key event
             */
            onGuessinputKeyPress: function (e) {
                if(e.which == 13) {// log in
                    if (App.$guessinput[0].value!='your guess' && App.$guessinput[0].value!=''){
                        App.Player.onSubmitAnswer();
                    }
                    else{
                    }
                }
            },

            select: function () {
                if (App.Host.selection_capacity>0){ // if still can select
                    Obj.raycaster.setFromCamera( App.mouse, Obj.camera );
                    App.Host.selectedStrings = [];
                    var intersections=[];

                    try {
                        intersections = Obj.raycaster.intersectObjects( Obj.scene.children[0].children);
                    } catch (e) {
                        intersections[0] = null ;
                    }
                    var intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

                    if (intersection != null) {
                        if(Obj.object.getObjectByName(intersection.object.name).allSelectedID.indexOf(intersection.faceIndex)==-1){//if not selected
                            Obj.selectNeighboringFaces3(
                                Obj.scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].a,
                                Obj.scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].b,
                                Obj.scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex,intersection.object.name);
                            //console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
                            //console.log('with doubles');
                            //console.log(App.Host.selectedStrings);
                            App.Host.selectedStrings =App.Host.selectedStrings.filter(App.onlyUnique);
                            //console.log('only unique ');
                            //console.log(App.Host.selectedStrings);

                            //$.each(selectedStrings, function(i,ss){
                            //
                            //})

                            App.Host.selectedStrings = App.diff(App.Host.selectedStrings, Obj.object.getObjectByName(intersection.object.name).allSelectedID); // only emit new selection

                            //console.log('only new selections');
                            //console.log(App.Host.selectedStrings);
                            $.each(App.Host.selectedStrings, function(i, SS) {
                                Obj.object.getObjectByName(intersection.object.name).allSelectedID.push(SS);
                            });
                            //console.log('allSelectedID');
                            //console.log(Obj.object.getObjectByName(intersection.object.name).allSelectedID);
                            // = Obj.object.getObjectByName(intersection.object.name).allSelectedID.concat(App.Host.selectedStrings).filter( App.onlyUnique ); // update all selection
                            var uniqueValues = [];
                            $.each(App.Host.selectedStrings, function (i) {
                                uniqueValues.push(App.Host.selectedStrings[i]);
                            });//.filter(App.onlyUnique);

                            // update selection capacity
                            var index = -1;
                            for (var i = 0 ; i< Obj.scene.children[0].children.length; i++) {
                                if (Obj.object.children[i].name == intersection.object.name) {
                                    index = i;
                                    break;
                                }

                                for (var j = 0; j < uniqueValues.length; j++)
                                    uniqueValues[j] = uniqueValues[j] + Obj.object.FaceArray[i];

                            }


                            $.each(uniqueValues, function(i,UV) {
                                App.Host.allSelectedIDMaster.push(UV);
                            });



                            App.Host.selectedStrings.unshift(index);
                            App.Host.selection_capacity = App.Host.selection_capacity - App.Host.selectedStrings.length + 1;
                            App.$bar.css('opacity', App.Host.selection_capacity/1000*App.progressbar_size);

                            IO.socket.emit('selection',JSON.stringify(App.Host.selectedStrings));
                        }
                    }
                }
            },

            /**
             * The Host screen is displayed for the first time.
             * @param data{{ gameId: int, mySocketId: * }}
             */
            gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                //App.Host.displayNewGameScreen();
                // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            }

            /**
             * Show the Host screen containing the game URL and unique game ID
             */
            //displayNewGameScreen : function() {
            //    // Fill the game screen with the appropriate HTML
            //    App.$gameArea.html(App.$templateNewGame);
            //
            //    // Display the URL on screen
            //    $('#gameURL').text(window.location.href);
            //    App.doTextFit('#gameURL');
            //
            //    // Show the gameId / room id on screen
            //    $('#spanNewGameCode').text(App.gameId);
            //},

            /**
             * Update the Host screen when the first player joins
             * @param data{{playerName: string}}
             */
            //updateWaitingScreen: function(data) {
            //    // If this is a restarted game, show the screen.
            //    if ( App.Host.isNewGame ) {
            //        App.Host.displayNewGameScreen();
            //    }
            //    // Update host screen
            //    $('#playersWaiting')
            //        .append('<p/>')
            //        .text('Player ' + data.playerName + ' joined the game.');
            //
            //    // Store the new player's data on the Host.
            //    App.Host.players.push(data);
            //
            //    // Increment the number of players in the room
            //    App.Host.numPlayersInRoom += 1;
            //
            //    // If two players have joined, start the game!
            //    if (App.Host.numPlayersInRoom === 2) {
            //        // console.log('Room is full. Almost ready!');
            //
            //        // Let the server know that two players are present.
            //        IO.socket.emit('hostRoomFull',App.gameId);
            //    }
            //},

            /**
             * Show the countdown screen
             */
            //gameCountdown : function() {
            //
            //    // Prepare the game screen with new HTML
            //    App.$gameArea.html(App.$hostGame);
            //    App.doTextFit('#hostWord');
            //
            //    // Begin the on-screen countdown timer
            //    var $secondsLeft = $('#hostWord');
            //    App.countDown( $secondsLeft, 5, function(){
            //        IO.socket.emit('hostCountdownFinished', App.gameId);
            //    });
            //
            //    // Display the players' names on screen
            //    $('#player1Score')
            //        .find('.playerName')
            //        .html(App.Host.players[0].playerName);
            //
            //    $('#player2Score')
            //        .find('.playerName')
            //        .html(App.Host.players[1].playerName);
            //
            //    // Set the Score section on screen to 0 for each player.
            //    $('#player1Score').find('.score').attr('id',App.Host.players[0].mySocketId);
            //    $('#player2Score').find('.score').attr('id',App.Host.players[1].mySocketId);
            //},

            /**
             * Show the word for the current round on screen.
             * @param data{{round: *, word: *, answer: *, list: Array}}
             */
            //newWord : function(data) {
            //    // Insert the new word into the DOM
            //    $('#hostWord').text(data.word);
            //    App.doTextFit('#hostWord');
            //
            //    // Update the data for the current round
            //    App.Host.currentCorrectAnswer = data.answer;
            //    App.Host.currentRound = data.round;
            //},

            /**
             * Check the answer clicked by a player.
             * @param data{{round: *, playerId: *, answer: *, gameId: *}}
             */
            //checkAnswer : function(data) {
            //    // Verify that the answer clicked is from the current round.
            //    // This prevents a 'late entry' from a player whos screen has not
            //    // yet updated to the current round.
            //    if (data.round === App.currentRound){
            //
            //        // Get the player's score
            //        var $pScore = $('#' + data.playerId);
            //
            //        // Advance player's score if it is correct
            //        if( App.Host.currentCorrectAnswer === data.answer ) {
            //            // Add 5 to the player's score
            //            $pScore.text( +$pScore.text() + 5 );
            //
            //            // Advance the round
            //            App.currentRound += 1;
            //
            //            // Prepare data to send to the server
            //            var data = {
            //                gameId : App.gameId,
            //                round : App.currentRound
            //            }
            //
            //            // Notify the server to start the next round.
            //            IO.socket.emit('hostNextRound',data);
            //
            //        } else {
            //            // A wrong answer was submitted, so decrement the player's score.
            //            $pScore.text( +$pScore.text() - 3 );
            //        }
            //    }
            //},


            /**
             * All 10 rounds have played out. End the game.
             * @param data
             */
            //endGame : function(data) {
            //    // Get the data for player 1 from the host screen
            //    var $p1 = $('#player1Score');
            //    var p1Score = +$p1.find('.score').text();
            //    var p1Name = $p1.find('.playerName').text();
            //
            //    // Get the data for player 2 from the host screen
            //    var $p2 = $('#player2Score');
            //    var p2Score = +$p2.find('.score').text();
            //    var p2Name = $p2.find('.playerName').text();
            //
            //    // Find the winner based on the scores
            //    var winner = (p1Score < p2Score) ? p2Name : p1Name;
            //    var tie = (p1Score === p2Score);
            //
            //    // Display the winner (or tie game message)
            //    if(tie){
            //        $('#hostWord').text("It's a Tie!");
            //    } else {
            //        $('#hostWord').text( winner + ' Wins!!' );
            //    }
            //    App.doTextFit('#hostWord');
            //
            //    // Reset game data
            //    App.Host.numPlayersInRoom = 0;
            //    App.Host.isNewGame = true;
            //},

            /**
             * A player hit the 'Start Again' button after the end of a game.
             */
            //restartGame : function() {
            //    App.$gameArea.html(App.$templateNewGame);
            //    $('#spanNewGameCode').text(App.gameId);
            //}
        },


        /* *****************************
         *        PLAYER CODE        *
         ***************************** */

        Player : {

            /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * All face ID for the current object
             */
            allSelectedID: [],

            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                // console.log('Clicked "Join A Game"');

                // Display the Join Game HTML on the player's screen.
                //App.$gameArea.html(App.$templateJoinGame);

                console.log('Try finding a player...');

                //collect data to send to the server
                var data = {
                    playerName : 'max',
                    objectID : 999
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('joinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },

            /**
             *  Click handler for the Player hitting a word in the word list.
             */
            onSubmitAnswer: function() {
                var answer = $('#guessinput')[0].value;
                var data = {
                    gameId: App.gameId,
                    playerId: App.mySocketId,
                    answer: answer,
                    correct: $.inArray(answer.toLowerCase(), Obj.correct_answer)>=0,
                    round: App.currentRound
                };
                IO.socket.emit('checkAnswer',data);
            },

            /**
             *  Click handler for the "Start Again" button that appears
             *  when a game is over.
             */
            onPlayerRestart : function() {
                //var data = {
                //    gameId : App.gameId,
                //    playerName : App.Player.myName
                //}
                //IO.socket.emit('playerRestart',data);
                //App.currentRound = 0;
                //$('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },

            /**
             * Display the waiting screen for player 1
             * @param data
             */
            updateWaitingScreen : function(data) {
                if(IO.socket.id === data.mySocketId){
                    //App.myRole = 'Player';
                    App.gameId = data.gameId;

                    //$('#playerWaitingMessage')
                    //    .append('<p/>')
                    //    .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
                    $('#wait').show();
                }
            },

            /**
             * Display 'Get Ready' while the countdown timer ticks down.
             * @param hostData
             */
            gameCountdown : function(hostData) {
                //App.Player.hostSocketId = hostData.mySocketId;
                //$('#gameArea')
                //    .html('<div class="gameOver">Get Ready!</div>');
            },

            /**
             * Show the "Game Over" screen.
             */
            endGame : function() {
                //$('#gameArea')
                //    .html('<div class="gameOver">Game Over!</div>')
                //    .append(
                //    // Create a button to start a new game.
                //    $('<button>Start Again</button>')
                //        .attr('id','btnPlayerRestart')
                //        .addClass('btn')
                //        .addClass('btnGameOver')
                //);
            }
        },


        /* **************************
         UTILITY CODE
         ************************** */

        /**
         * Display the countdown timer on the Host screen
         *
         * @param $el The container element for the countdown timer
         * @param startTime
         * @param callback The function to call when the timer ends.
         */
        countDown : function( $el, startTime, callback) {

            // Display the starting time on the screen.
            $el.text(startTime);
            App.doTextFit('#hostWord');

            // console.log('Starting Countdown...');

            // Start a 1 second timer
            var timer = setInterval(countItDown,1000);

            // Decrement the displayed timer value on each 'tick'
            function countItDown(){
                startTime -= 1;
                $el.text(startTime);
                App.doTextFit('#hostWord');

                if( startTime <= 0 ){
                    // console.log('Countdown Finished.');

                    // Stop the timer and do the callback.
                    clearInterval(timer);
                    callback();
                    return;
                }
            }
        },

        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        },

        diff: function(a, b) {
            return a.filter(function(i) {return b.indexOf(i) < 0;});
        },

        onlyUnique: function(value, index, self) {
            return self.indexOf(value) === index;
        },

        lastTapTime : 0,
        isJqmGhostClick: function(event) {
            var currTapTime = new Date().getTime();
            if(App.lastTapTime == null || currTapTime > (App.lastTapTime + 300)) {
                App.lastTapTime = currTapTime;
                return false;
            }
            else {
                return true;
            }
        }

    };


    var Obj = {
        camera: [],
        raycaster: [],
        scene: [],
        object: [],
        emptyobject: [], // for the hidden obj on the player's side
        renderer: [],
        correct_answer: '',
        theta: 0, // camera angle x
        beta: 0, // camera angle y
        radius: 1500,
        height: [],
        scale: [],

        init: function() {
            var container = App.$model[0];
            Obj.camera = new THREE.PerspectiveCamera( 70, App.$model.width() / App.$model.height(), 1, 10000 );

            Obj.scene = new THREE.Scene();
            var background = new THREE.Scene();
            background.name = "background";
            Obj.createTextureCube();
            Obj.object = new THREE.SceneLoad;
            Obj.object.name = Obj.correct_answer[0]; // use the first answer as the object name

            if(App.myRole=='Player'){
                Obj.emptyobject = new THREE.Scene();
                Obj.emptyobject.name = "emptyobject";
                Obj.emptyobject.castShadow  = true;
            }
            else{
                Obj.object.castShadow  = true;
            }


            if(App.myRole == 'Host'){
                Obj.scene.add(Obj.object);
                Obj.object.castShadow = true;
            }
            else{
                Obj.scene.add(Obj.emptyobject);
            }
            Obj.camera.position.x = -Obj.radius;
            Obj.camera.position.y = Obj.height; //don't change
            Obj.camera.position.z = 0;

            Obj.createLights();

            Obj.raycaster = new THREE.Raycaster();

            Obj.renderer = new THREE.WebGLRenderer( { antialias: true } );
            Obj.renderer.setPixelRatio( window.devicePixelRatio );

            //if (App.VRMODE){
            //    var fullScreenButton = document.querySelector( '.full-screen' );
            //    var mouseLookButton = document.querySelector( '.mouse-look' );
            //    var mouseLook = false;
            //
            //    vrControls = new THREE.VRControls(camera);
            //    mouseControls = new THREE.MouseControls(camera);
            //    headControls = vrControls;
            //
            //    fullScreenButton.onclick = function() {
            //
            //        mouseLook = !mouseLook;
            //        headControls = vrControls;
            //        vrEffect.setFullScreen( true );
            //        headControls.zeroSensor();
            //    };
            //    mouseLookButton.onclick = function() {
            //
            //        mouseLook = !mouseLook;
            //
            //        if (mouseLook) {
            //            headControls = mouseControls;
            //            mouseLookButton.classList.add('enabled');
            //        } else {
            //            headControls = vrControls;
            //            mouseLookButton.classList.remove('enabled');
            //            headControls.zeroSensor();
            //        }
            //    }
            //
            //    vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
            //    function VREffectLoaded(error) {
            //        if (error) {
            //            fullScreenButton.innerHTML = error;
            //            fullScreenButton.classList.add('error');
            //        }
            //    }
            //}

            Obj.renderer.setClearColor( 0xeeeeee );
            Obj.renderer.setSize( App.$model.width(), App.$model.height());
            Obj.renderer.sortObjects = false;
            container.appendChild( Obj.renderer.domElement );
        },

        animate: function() {
            requestAnimationFrame(Obj.animate);
            Obj.render();
        },

        render: function() {
            if(App.myRole == 'Host'){
                if(typeof(Obj.object)!='undefined'){

                    Obj.object.rotation.set( Math.max(-Math.PI/6,Math.min(Obj.object.rotation.x - Obj.beta, Math.PI/6)),
                        Obj.object.rotation.y + Obj.theta, 0, 'XYZ' );
                }
            }
            else{
                if(typeof(Obj.emptyobject)!='undefined'){
                    Obj.emptyobject.rotation.set( Math.max(-Math.PI/6,Math.min(Obj.emptyobject.rotation.x - Obj.beta, Math.PI/6)),
                        Obj.emptyobject.rotation.y + Obj.theta, 0, 'XYZ' );
                }
            }

            Obj.camera.position.x = 0;
            Obj.camera.position.y = Obj.height; //don't change
            Obj.camera.position.z = Obj.radius;

            if (App.VRMODE){
                Obj.headControls.update();
                Obj.vrEffect.render( Obj.scene, Obj.camera );
            }
            else{
                Obj.renderer.render( Obj.scene, Obj.camera);
                if(typeof(Obj.object.getObjectByName("selectable"))!='undefined'){
                    Obj.object.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
                }
            }

            // countdown when object is shown
            App.$timebar.css('opacity',1-(Date.now()-App.currentTime)/App.totalTime/60000);
            if (1-(Date.now()-App.currentTime)/App.totalTime/60000<=0){
                IO.gameOver();
            }
        },

        createTextureCube: function() {
            var r = "textures/bridge/";
            var urls = [ r + "posx.jpg", r + "negx.jpg",
                r + "posy.jpg", r + "negy.jpg",
                r + "posz.jpg", r + "negz.jpg" ];

            var textureCube = THREE.ImageUtils.loadTextureCube( urls );
            textureCube.format = THREE.RGBFormat;
            textureCube.mapping = THREE.CubeReflectionMapping;
            return textureCube;
        },

        createLights: function() {
            var ambient = new THREE.AmbientLight( 0x020202 );
            Obj.scene.add( ambient );

            var directionalLight1 = new THREE.DirectionalLight( 0xffffff );
            directionalLight1.position.set( Obj.camera.position.z + 50, Obj.camera.position.y, - Obj.camera.position.x );//.normalize();

            var directionalLight2 = new THREE.DirectionalLight( 0xffffff );
            directionalLight2.position.set( 1000, 500,-1000 );//.normalize();
            Obj.scene.add( directionalLight1 );
            Obj.scene.add( directionalLight2 );
        },

        /**
         * create mesh faces on the player side
         * @param selection: current face ids from meshes
         * @param childnumber: current mesh id
         */
        createMesh: function(selection, childnumber ) {
            //var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} );

            $.each(selection, function (i, s) {
                //if (App.Player.allSelectedID.indexOf(s) == -1) {
                //   App.Player.allSelectedID.push(s);

                    var geom = new THREE.Geometry();

                    var f = Obj.object.children[childnumber].geometry.faces[s];
                    var v1 = Obj.object.children[childnumber].geometry.vertices[f.a];
                    var v2 = Obj.object.children[childnumber].geometry.vertices[f.b];
                    var v3 = Obj.object.children[childnumber].geometry.vertices[f.c];

                    geom.vertices.push(v1, v2, v3);
                    var nf = new THREE.Face3(0, 1, 2);
                    nf.vertexNormals = f.vertexNormals;
                    nf.normal = f.normal;
                    geom.faces.push(nf);

                    var mesh = new THREE.Mesh(geom, Obj.object.children[childnumber].material);
                    mesh.rotation.y = 1;
                    mesh.scale.set(Obj.scale, Obj.scale, Obj.scale);
                    mesh.castShadow = true;
                    mesh.position.y = Obj.height;
                    Obj.emptyobject.add(mesh);
               // }
                //else {

                //}
            });
        },

        /**
         * 3rd iteration of the mesh selection algorithm, works in conjunction
         * with the second version
         * @param a
         * @param b
         * @param c
         * @param iteration
         * @param faceindex
         * @param name
         */
        selectNeighboringFaces3: function(a,b,c,iteration,faceindex, name) {
            for (var i=0; i<13; i++) {
                if (Obj.object.getObjectByName(name).sorted[1][i][a] != undefined) {
                    if (iteration!=0) {

                        Obj.selectNeigboringFaces2(
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][a]].a,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][a]].b,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][a]].c,
                            iteration-1,Obj.object.getObjectByName(name).sorted[1][i][a], name);
                    }

                }

                if (Obj.object.getObjectByName(name).sorted[1][i][b] != undefined) {
                    if (iteration!=0) {

                        Obj.selectNeigboringFaces2(
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][b]].a,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][b]].b,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][b]].c,
                            iteration-1,Obj.object.getObjectByName(name).sorted[1][i][b], name);
                    }
                }


                if (Obj.object.getObjectByName(name).sorted[1][i][c] != undefined) {
                    if (iteration!=0) {

                        Obj.selectNeigboringFaces2(
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][c]].a,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][c]].b,
                            Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[1][i][c]].c,
                            iteration-1,Obj.object.getObjectByName(name).sorted[1][i][c], name);
                    }
                }
            }
        },

        /**
         * 2nd iteration of the selection algorithm that works with the 3rd
         * @param a
         * @param b
         * @param c
         * @param iteration
         * @param faceIndex
         * @param name
         */
        selectNeigboringFaces2: function(a, b, c, iteration, faceIndex, name) {

                App.Host.selectedStrings.push(faceIndex);

            if (Obj.object.getObjectByName(name).sorted[0][0][a] == faceIndex) {
                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][1][a]].a,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][1][a]].b,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][1][a]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][1][a])
                }
            } else if (Obj.object.getObjectByName(name).sorted[0][1][a] == faceIndex) {
                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].a,
                        Obj.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].b,
                        Obj.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][0][a])
                }

            }

            if (Obj.object.getObjectByName(name).sorted[0][2][b] == faceIndex) {
                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][3][b]].a,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][3][b]].b,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][3][b]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][3][b])
                }
            } else if (Obj.object.getObjectByName(name).sorted[0][3][b] == faceIndex) {
                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][2][b]].a,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][2][b]].b,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][2][b]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][2][b])
                }

            }

            if (Obj.object.getObjectByName(name).sorted[0][4][c] == faceIndex) {

                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][5][c]].a,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][5][c]].b,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][5][c]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][5][c])
                }
            } else if (Obj.object.getObjectByName(name).sorted[0][5][c] == faceIndex) {
                if (iteration != 0) {
                    Obj.selectNeigboringFaces2(
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][4][c]].a,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][4][c]].b,
                        Obj.object.getObjectByName(name).geometry.faces[Obj.object.getObjectByName(name).sorted[0][4][c]].c, iteration - 1, Obj.object.getObjectByName(name).sorted[0][4][c])
                }

            }
        },

        /**
         * initialize obj parameters, ONLY used initially offline before any game
         */
        initial_obj: function () {
            var objectstring_set = ["obj/BMW 328/BMW328MP.js", "obj/Dino/Dino.js", "obj/fedora/fedora.js", "obj/Helmet/Helmet.js", "obj/iPhone/iPhone.js", "obj/Lampost/LampPost.js", "obj/Teapot/Teapot.js"];
            //$.each(objectstring_set, function(i,string){
            //for(var i = 0; i<objectstring_set.length; i++){
            var string = objectstring_set[1];
            $.getScript(string, function () {
                THREE.SceneLoad();
                $.post('/initial_obj', {
                    'object_name': THREEScene.name,
                    'face_per_mesh': THREEScene.FaceArray,
                    'num_selections': []
                }, function () {
                });
            });
        }
    };

    game.IO = IO;
    game.App = App;
    game.Obj = Obj;
    return game;
})(jQuery);
GAME.App.init();
GAME.IO.init();

