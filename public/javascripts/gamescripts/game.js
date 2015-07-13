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
            IO.socket.on('newGameId',IO.newGameId );
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
            App.objectstring_set = data.objectstring_set;
            App.objectString = App.objectstring_set[data.objectID];

            App.$wait.hide();
            App.$game.show();
            App.totalTime = 5; // total game time is 5 min

            // host saves the game
            if(App.myRole=='Host'){
                $.post('/newGame',{},function(data){
                    // broadcast game id
                    IO.socket.emit('broadcastGameID', data[0].id);
                    // create a new object and start the game
                    IO.onNewObjData();
                });
            }
            else{
                IO.onNewObjData();
            }
        },

        /**
         * Receive broadcast game id
         * @param data
         */
        newGameId: function(data) {
            App.gameId = data.gameId;
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
                var childName = selections.shift().toString();
                if (App.myRole == 'Player') {
                    // create meshes on fly

                    Obj.createMesh(selections, childName);
                    // update selection capacity
                    App.selection_capacity = App.selection_capacity - selections.length;
                    App.$bar.css('opacity', App.selection_capacity / 1000 * App.progressbar_size);
                    App.$bar.css('background-color', '#333333');
                }
                else if (App.myRole == 'Host') {
                    $.each(selections, function(id,i){
                        Obj.object.getObjectByName(childName).geometry.faces[i].color.setHex(0xff7777);
                    });
                    Obj.object.getObjectByName(childName).geometry.colorsNeedUpdate = true;
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
        onPlayerReady : function(objectId) {
            // switch role
            if(App.myRole == 'Host'){
                App.myRole = 'Player';
            }
            else{
                App.myRole = 'Host';
            }

            App.$wait.hide();
            App.$game.show();
            App.objectString = "";

            //var possibleObjects = ["obj/Princeton/1.js","obj/Dino/Dino.js","obj/fedora/fedora.js","obj/iPhone/iPhone.js","obj/BMW 328/BMW328MP.js","obj/Helmet/Helmet.js","Obj/Lampost/LampPost.js"]; //if this becomes longer also update the length at /routes/games.js LN:44;
            //App.objectString = possibleObjects[objectID.objectID];

            App.objectString = App.objectstring_set[objectId.objectID];


            IO.onNewObjData({});
        },

        /**
         * A new obj for the round is returned from the server.
         * @param data
         */
        onNewObjData : function(callback) {
            $.getScript( App.objectString, function() {
                console.log( "New object loaded." );
                // reset game
                App.Host.selection_capacity = 10000; // assign player selection capacity for current obj
                Obj.correct_answer = answer; // get correct answers
                Obj.height = zheight;
                Obj.scale = scale;

                App.$model.html('');
                if(App.myRole == 'Player'){
                    App.$menu.show();
                    App.$guessoutput.hide();
                    App.$guessinput.show();
                    App.$guessinput[0].value='';
                }
                else if(App.myRole == 'Host'){
                    App.$menu.show();
                    App.$guessoutput.show();
                    App.$guessoutput[0].value='';
                    App.$guessinput.hide();
                }
                App.$model.focus(); // focus on $model so that key events can work

                App.start_obj_time = Date.now();
                App.currentTime = Date.now();
                Obj.init(callback);
                Obj.animate();
                Obj.object.rotation.y = Math.random()*Math.PI*2;
                //console.log('rotation:');
                //console.log(GAME.Obj.object.rotation.y );
            });
        },

        /**
         * Let everyone know the game has ended.
         * @param data
         */
        gameOver : function() {

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
         * game id
         */
        gameId: [],


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

        /**
         * Object string contains all objects
         */
        objectstring_set : [],

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
            App.$home = $('#home');
            App.$game = $('#game');
            App.$stat = $('#stat');
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
            App.$continue = $('#continue');
            App.$continue_btn = $('#continue_btn');
            App.$home_btn = $($('li')[0]);
            App.$game_btn = $($('li')[1]);
            App.$stat_btn = $($('li')[2]);

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

                // move to game
                App.$home_btn.removeClass('active');
                App.$game_btn.addClass('active');
            });
            App.$continue_btn.click(function(){
                App.$continue.hide();
                App.$wait.show();
                IO.socket.emit('playerReady');
            });

            // navigation
            App.$home_btn.click(function(){
                App.quit(); // quit game
                App.$home.show();
                App.$wait.hide();
                App.$stat.hide();
                App.$home_btn.addClass('active');
                App.$game_btn.removeClass('active');
                App.$stat_btn.removeClass('active');
            });

            App.$game_btn.click(function(){
                App.Player.onJoinClick();
                App.$home.hide();
                App.$wait.show();
                App.$stat.hide();
                App.$home_btn.removeClass('active');
                App.$game_btn.addClass('active');
                App.$stat_btn.removeClass('active');
            });

            App.$stat_btn.click(function(){
                App.myRole = 'None';
                App.$home.hide();
                App.$wait.hide();
                App.$game.hide();
                App.$stat.show();
                App.$stat.html("");
                App.showList(); // show all objects available
                App.$home_btn.removeClass('active');
                App.$game_btn.removeClass('active');
                App.$stat_btn.addClass('active');
            });

            App.$stat.on('click', '.object_div', function(){
               Obj.showHeatmap(this.id-1);
               // database id starts with 1. NOTE: Here database order and objectstring_set order are the same
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

        /**
         *
         */
        showList: function(){
            $.post('/getObjectList',{},function(data){
                $.each(data, function(i,d){
                    $("#stat").append("<div class='object_div btn btn-lg btn-default' id="
                        + d.id + ">" + "<a>" + d.object_name + "</a></div> ");
                })
            })
        },



        /* *******************************
         *         HOST CODE           *
         ******************************* */
        Host : {

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
                if(e.which == 13) {// submit guess
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

                            // Below is Fabian's code for encoding face ids from different meshes
                            //var uniqueValues = [];
                            //$.each(App.Host.selectedStrings, function (i) {
                            //    uniqueValues.push(App.Host.selectedStrings[i]);
                            //});//.filter(App.onlyUnique);
                            //var index = -1;
                            //for (var i = 0 ; i< Obj.scene.children[0].children.length; i++) {
                            //    if (Obj.object.children[i].name == intersection.object.name) {
                            //        index = i;
                            //        break;
                            //    }
                            //
                            //    for (var j = 0; j < uniqueValues.length; j++)
                            //        uniqueValues[j] = uniqueValues[j] + Obj.object.FaceArray[i];
                            //
                            //}

                            // Max code for encoding face ids from different meshes
                            var mesh_id = parseInt(intersection.object.name);
                            var bias = 0;
                            for(var i=0;i<mesh_id;i++){
                                bias += Obj.object.FaceArray[i];
                            }
                            var uniqueValues = [];
                            $.each(App.Host.selectedStrings, function (i,s) {
                                uniqueValues.push(s+bias);
                            });



                            $.each(uniqueValues, function(i,UV) {
                                App.Host.allSelectedIDMaster.push(UV);
                            });



                            App.Host.selectedStrings.unshift(parseInt(intersection.object.name));
                            App.Host.selection_capacity = App.Host.selection_capacity - App.Host.selectedStrings.length + 1;
                            App.$bar.css('opacity', App.Host.selection_capacity/1000*App.progressbar_size);

                            IO.socket.emit('selection',JSON.stringify(App.Host.selectedStrings));
                        }
                    }
                }
            },

            /**
             * send out quit signal
             */
            quit: function(){
                IO.socket.emit('playerQuit');
            },

            /**
             * both user quit
             */
            quitGame: function(){
                App.$home.show();
                App.$wait.hide();
                App.$stat.hide();
                App.$home_btn.addClass('active');
                App.$game_btn.removeClass('active');
                App.$stat_btn.removeClass('active');
            }
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
                    objectId : 999
                };

                IO.socket.emit('joinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },

            /**
             *  Click handler for the Player to submit and store a guess.
             */
            onSubmitAnswer: function() {
                //var weight = [];
                //$.each(App.allSelectedIDMaster, function(i,d){
                //    weight.push(1-weight.length/App.allSelectedIDMaster.length);
                //});

                var answer = $('#guessinput')[0].value;
                var data = {
                    game_id: App.gameId,
                    answer: answer,
                    correct: $.inArray(answer.toLowerCase(), Obj.correct_answer)>=0,
                    round: App.currentRound,
                    duration: Date.now()-App.start_obj_time, // time from start of the object
                    score: App.score,
                    object_name: Obj.object.name,
                    all_selected_id: JSON.stringify(App.Host.allSelectedIDMaster)
                    //weight: JSON.stringify(weight)
                };
                $.post('/store_selection',data,function(){
                    IO.socket.emit('checkAnswer',data);
                });
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
        object_id: [],
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

        init: function(callback) {
            var container = App.$model[0];
            Obj.camera = new THREE.PerspectiveCamera( 70, App.$model.width() / App.$model.height(), 1, 10000 );

            Obj.scene = new THREE.Scene();
            var background = new THREE.Scene();
            background.name = "background";
            Obj.createTextureCube();
            Obj.object = THREE.SceneLoad(callback);
            Obj.object.name = Obj.correct_answer[0]; // use the first answer as the object name

            if(App.myRole=='Player'){
                Obj.emptyobject = new THREE.Scene();
                Obj.emptyobject.name = "emptyobject";
                Obj.emptyobject.castShadow  = true;
            }
            else{
                Obj.object.castShadow  = true;
            }


            if(App.myRole == 'Player'){
                Obj.scene.add(Obj.emptyobject);
            }
            else{
                Obj.scene.add(Obj.object);
                Obj.object.castShadow = true;
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

        showHeatmap: function(id) {
            App.$game.show();
            App.$menu.hide();
            App.$model.html(""); // clean canvas
            App.objectString = App.objectstring_set[id];
            IO.onNewObjData(function(){
                var weight = new Array(Obj.object.FaceArray.length);
                $.each(weight, function(i,e){weight[i] = new Array(Obj.object.children[i].geometry.faces.length);});
                var raw_face_id_array, mesh_id, face_id, max_weight, count;
                $.post('/read_selection',{'object_name':Obj.object.name},function(response){
                        $.each(response, function(i,r){
                            raw_face_id_array = r.all_selected_id;
                            $.each(raw_face_id_array, function(j,raw_face_id){
                                mesh_id = 0; face_id = raw_face_id;
                                count = 0;
                                while(face_id-Obj.object.FaceArray[count]>=0){
                                    face_id -= Obj.object.FaceArray[count];
                                    mesh_id ++;
                                    count ++;
                                }

                                if(typeof weight[mesh_id][face_id] == 'undefined'){
                                    weight[mesh_id][face_id] = 1;
                                }
                                else{
                                    weight[mesh_id][face_id] += 1;
                                }
                            })
                        });

                        max_weight = [];
                        $.each(weight, function(i,w_mesh){
                            max_weight.push(Math.max.apply(null, w_mesh.filter(function (x) {
                                return isFinite(x);
                            })));
                        });
                        var max_max_weight = Math.max.apply(Math,max_weight);
                        $.each(weight, function(mesh_id,face_for_mesh){
                            $.each(face_for_mesh, function(face_id,w){
                                if(w){
                                    if (face_id>=Obj.object.children[mesh_id].geometry.faces.length){
                                        var stop = 1;
                                    }
                                    Obj.object.children[mesh_id].geometry.faces[face_id].color.r = Math.max(w/max_max_weight,0.7);
                                    Obj.object.children[mesh_id].geometry.faces[face_id].color.g = Math.max(w/max_max_weight/5,0.2);
                                    Obj.object.children[mesh_id].geometry.faces[face_id].color.b = Math.max(w/max_max_weight/5,0.2);
                                }
                                //else{
                                //    Obj.object.children[mesh_id].geometry.faces[face_id].color.r = 0.2;
                                //    Obj.object.children[mesh_id].geometry.faces[face_id].color.g = 0.2;
                                //    Obj.object.children[mesh_id].geometry.faces[face_id].color.b = 0.2;
                                //}
                            });
                            Obj.object.children[mesh_id].geometry.colorsNeedUpdate = true;
                        });
                    }
                );
            });
        },

        animate: function() {
            requestAnimationFrame(Obj.animate);
            Obj.render();
        },

        render: function() {
            if(App.myRole != 'Player'){
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
        createMesh: function(selection, childName ) {
            //var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} );

            //update all selected face id, encoded by childname
            var mesh_id = parseInt(childName);
            var bias = 0;
            for(var i=0;i<mesh_id;i++){
                bias += Obj.object.FaceArray[i];
            }
            var uniqueValues = [];
            $.each(selection, function (i,s) {
                uniqueValues.push(s+bias);
            });
            App.Host.allSelectedIDMaster = App.Host.allSelectedIDMaster.concat(uniqueValues);

            $.each(selection, function (i, s) {
                //if (App.Player.allSelectedID.indexOf(s) == -1) {
                //   App.Player.allSelectedID.push(s);

                var geom = new THREE.Geometry();



                var f = Obj.object.getObjectByName(childName).geometry.faces[s];

                var v1 = Obj.object.getObjectByName(childName).geometry.vertices[f.a];
                var v2 = Obj.object.getObjectByName(childName).geometry.vertices[f.b];
                var v3 = Obj.object.getObjectByName(childName).geometry.vertices[f.c];

                //v1.sub(CG);
                       //v2.sub(CG);
                //v3.sub(CG);

                geom.vertices.push(v1, v2, v3);



                var nf = new THREE.Face3(0, 1, 2);
                nf.vertexNormals = f.vertexNormals;
                nf.normal = f.normal;
                geom.faces.push(nf);

                //geom.applyMatrix( new THREE.Matrix4().makeTranslation( Obj.object.CG[0]/225, Obj.object.CG[1]/225, Obj.object.CG[2]/225 ) );

                var mesh = new THREE.Mesh(geom, Obj.object.getObjectByName(childName).material);

                mesh.rotation.x = Obj.object.getObjectByName(childName).rotation.x;
                mesh.rotation.y = Obj.object.getObjectByName(childName).rotation.y;
                mesh.rotation.z = Obj.object.getObjectByName(childName).rotation.z;

                mesh.scale.set(Obj.scale, Obj.scale, Obj.scale);
                mesh.castShadow = true;


                if (Obj.object.CG_emptyObj != undefined) {

                    mesh.position.x =  Obj.object.CG_emptyObj[0];
                    mesh.position.y =  Obj.object.CG_emptyObj[1];
                    mesh.position.z =  Obj.object.CG_emptyObj[2];
                } else {
                    mesh.position.x = 0;
                    mesh.position.y = 0;
                    mesh.position.z = 0;
                }
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
         * "show_obj" and "upload_obj" initialize obj parameters, ONLY used initially offline before any game
         */
        show_obj: function (id) {
            var string = App.objectstring_set[id];
            $.getScript(string, function () {
                THREE.SceneLoad(Obj.upload_obj);
            });
        },
        upload_obj: function () {
            $.post('/initial_obj', {
                'object_name': THREEScene.name,
                'face_per_mesh': JSON.stringify(THREEScene.FaceArray),
                'num_selections': ""
                }
            );
        },

        paint_faces: function () {
            var r, g, b;
            var col;
            $.each(Obj.object.children[0].geometry.faces, function(i,f){
                col = Obj.getRGB(1/3*(
                    Obj.object.children[0].geometry.vertices[Obj.object.children[0].geometry.faces[i].a].salColor,
                    Obj.object.children[0].geometry.vertices[Obj.object.children[0].geometry.faces[i].b].salColor,
                    Obj.object.children[0].geometry.vertices[Obj.object.children[0].geometry.faces[i].c].salColor));

                Obj.object.children[0].geometry.faces[i].color.r = col[0]/255;
                Obj.object.children[0].geometry.faces[i].color.g = col[1]/255;
                Obj.object.children[0].geometry.faces[i].color.b = col[2]/255;
            });

            Obj.object.children[0].geometry.colorsNeedUpdate = true;


        },

        getRGB: function(val) {
            var min = GAME.Obj.object.children[0].geometry.colorMin;
            var max = GAME.Obj.object.children[0].geometry.colorMax;;

            if (val>max) {
                val = max;
            } else if (val < min) {
                val = min;
            }

            var half = (max + min)/2 ;
            var col = [0,0,0];

            if (val < half) {
                col[0] = 0;
                col[1]= 255/(half - min) * (val - min);
                col[2] =  255 - 255/(half - min)  * (val - min);
            } else if (half < val) {
                col[0] = 255/(max - half) * (val - half);
                col[1] = 255 + -255/(max - half)  * (val - half);
                col[2] = 0;
            }


            return (col);
        },


        /*
        calculates the center of an object so that it can be used to center it in the future
         */

        findCG: function () {
            var boundingBox = [[],[],[]];
            $.each(Obj.object.children, function(i, m) {
                console.log(i);
                m.geometry.computeBoundingBox();
                boundingBox[0].push(m.geometry.boundingBox.min.x);
                boundingBox[0].push(m.geometry.boundingBox.max.x);
                boundingBox[1].push(m.geometry.boundingBox.min.y);
                boundingBox[1].push(m.geometry.boundingBox.max.y);
                boundingBox[2].push(m.geometry.boundingBox.min.z);
                boundingBox[2].push(m.geometry.boundingBox.max.z);

            })
            boundingBox[0].sort();
            boundingBox[1].sort();
            boundingBox[2].sort();
            var CG = new THREE.Vector3;

            CG.x=[boundingBox[0][0],boundingBox[0][boundingBox[0].length-1]];
            CG.y=[boundingBox[1][0],boundingBox[1][boundingBox[1].length-1]];
            CG.z=[boundingBox[2][0],boundingBox[2][boundingBox[2].length-1]];

            console.log('[' + 0.5*(CG.x[0] + CG.x[1] ) + ', ' +
                0.5*(CG.y[0] + CG.y[1] ) + ', ' +
                0.5*(CG.z[0] + CG.z[1] ) + ']');
        }
    };

    game.IO = IO;
    game.App = App;
    game.Obj = Obj;
    return game;
})(jQuery);
GAME.App.init();
GAME.IO.init();

