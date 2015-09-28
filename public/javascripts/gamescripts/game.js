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
            IO.socket.on('getSocketStats', IO.getSocketStats);
            IO.socket.on('updateSocketStats', IO.updateSocketStats);
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
                    Obj.object_set = [];
                    IO.onNewObjData(App.$model);
                });
            }
            else{
                Obj.object_set = [];
                IO.onNewObjData(App.$model);
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
            if(Obj.object_set[0].object != undefined) { // if model exists
                var selections = JSON.parse(sig);
                var childName = selections.shift().toString();
                if (App.myRole == 'Player') {
                    // create meshes on fly

                    Obj.object_set[0].createMesh(selections, childName);
                    // update selection capacity
                    App.selection_capacity = App.selection_capacity - selections.length;
                    App.$bar.css('opacity', App.selection_capacity / 1000 * App.progressbar_size);
                    App.$bar.css('background-color', '#333333');
                }
                else if (App.myRole == 'Host') {
                    $.each(selections, function(id,i){
                        Obj.object_set[0].object.getObjectByName(childName).geometry.faces[i].color.setHex(0xff7777);
                    });
                    Obj.object_set[0].object.getObjectByName(childName).geometry.colorsNeedUpdate = true;
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

            Obj.object_set = [];
            IO.onNewObjData(App.$model);
        },

        /**
         * A new obj for the round is returned from the server.
         * @param data
         */
        onNewObjData : function(target, callback) {
            $.getScript( App.objectString, function() {
                // the following happens for a normal game
                if (typeof(callback) == 'undefined'){
                    callback = function(){
                        console.log( "New object loaded." );
                        // reset game
                        App.selection_capacity = 10000; // assign player selection capacity for current obj
                        o.correct_answer = answer[0]; // get correct answers
                        o.height = zheight;
                        o.scale = scale;



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

                        //o.object.rotation.y = Math.PI*2;
                        o.object.rotation.y = Math.random()*Math.PI*2;
                    }

                }
                App.$model.html('');
                var o = Obj.init(target, callback);
                o.animate();
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
        },

        /**
         * update number of players online and other miscs.
         */
        getSocketStats: function () {
            IO.socket.emit('getSocketStats');
        },
        updateSocketStats: function (data) {
            var numPlayer = data.numPlayer;
            $('#numPlayer').html(numPlayer + ' players online');
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

            // div for game
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
            App.$continue = $('#continue');

            // div for stats
            App.$stat = $('#stat');
            App.$comp_model1 = $('#comp_model1');
            App.$comp_model2 = $('#comp_model2');
            App.$objlist = $('#objlist');

            // buttons
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
            App.$objlist.css('bottom',menu_bottom);
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
            App.$model.mousemove(function(e){App.onMouseMove(e, App.$model)});
            App.$model.mousedown(function(e){App.onMouseDown(e, App.$model)});
            App.$model.mouseup(function(e){App.onMouseUp(e, App.$model)});
            App.$model.keyup(function(e){App.onKeyUp(e, App.$model)});
            App.$model.keydown(function(e){App.onKeyDown(e, App.$model)});
            App.$comp_model1.mousemove(function(e){App.onMouseMove(e, App.$comp_model1)});
            App.$comp_model1.mousedown(function(e){App.onMouseDown(e, App.$comp_model1)});
            App.$comp_model1.mouseup(function(e){App.onMouseUp(e, App.$comp_model1)});
            App.$comp_model2.mousemove(function(e){App.onMouseMove(e, App.$comp_model2)});
            App.$comp_model2.mousedown(function(e){App.onMouseDown(e, App.$comp_model2)});
            App.$comp_model2.mouseup(function(e){App.onMouseUp(e, App.$comp_model2)});

            window.addEventListener( 'resize', App.onWindowResize, false );

            // Player
            App.$guessinput.on('keypress', App.onGuessinputKeyPress);
            App.$entry.click(function(){
                App.$home.hide();
                App.$wait.show();
                App.onJoinClick();

                // move to game
                App.$home_btn.removeClass('active');
                App.$game_btn.addClass('active');
                IO.getSocketStats();
            });
            App.$continue_btn.click(function(){
                App.$continue.hide();
                App.$wait.show();
                IO.socket.emit('playerReady');
                IO.getSocketStats();
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
                App.onJoinClick();
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
                App.$comp_model1.html(""); // clean div for new models
                App.$comp_model2.html("");
                App.showList(); // show all objects available
                App.$home_btn.removeClass('active');
                App.$game_btn.removeClass('active');
                App.$stat_btn.addClass('active');
            });

            App.$stat.on('click', '.object_div', function(){
                // clear previoius drawings
                Obj.object_set = [];
                App.$comp_model1.html('');
                App.$comp_model2.html('');

                // show our saliency
                var id = this.id-1;
                Obj.showHeatmap(id,0,App.$comp_model1, function(){
                    // show existing saliency
                    Obj.showHeatmap(id,1,App.$comp_model2);
                });
                // database id starts with 1. NOTE: Here database order and objectstring_set order are the same
            });
        },


        /**
         * check if the global list objectstring_set in routes\games.js is the same as the object table,
         * if not, add new table entries and the objectstring list
         * ONLY USED BY ADMINISTRATOR
         * NOT YET IMPLEMENTED
         */
        updateDatabase: function () {
            $.post('update_database');
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

            $.each(Obj.object_set, function(i,o){
                o.camera.aspect = App.$model.width() / App.$model.height();
                o.camera.updateProjectionMatrix();
                /* if (VRMODE) {
                 Obj.vrEffect.setSize(window.innerWidth, window.innerHeight);
                 }
                 else {*/
                o.renderer.setSize(App.$model.width(), App.$model.height());
                //}
            });
        },

        /**
         * when mouse move, change view and do select() when SELECT is true
         * @param e: mouse event
         */
        onMouseMove: function (e, target) {
            e.preventDefault();
            var tempx = App.mouse.x;
            var tempy = App.mouse.y;
            App.mouse.x = ( e.clientX / target.width()) * 2 - 1;
            App.mouse.y = - ( e.clientY / target.height() ) * 2 + 1;
            if (App.PRESSED == true){
                if (App.SELECT == true) {
                    App.select();
                }
                else {
                    $.each(Obj.object_set, function(i,o){
                        o.theta = (App.mouse.x - tempx)*4.0;
                        o.beta = (App.mouse.y-tempy)*2.0;
                    });
                }
            }
        },


        /**
         when mouse button is clicked. If the 's' key is simultaneously pressed the geometry is selected,
         if not, the model is rotated

         */
        onMouseDown: function (e, target) {
            e.preventDefault();
            if (!App.isJqmGhostClick(event)) {
                App.PRESSED = true;
                if (App.PRESSED == true && App.SELECT == true) {
                    App.mouse.x = ( e.clientX / target.width() ) * 2 - 1;
                    App.mouse.y = -( e.clientY / target.height() ) * 2 + 1;
                    App.select();

                }
            }
        },

        /**
         prevents events from continuing once mouse click is released.
         */

        onMouseUp: function (e) {
            e.preventDefault();
            App.PRESSED = false;
            $.each(Obj.object_set, function(i,o){
                o.theta = 0;
                o.beta = 0;
            });
        },

        /**
         * when key down: s: make selection, z: show heatmap (obsolete soon), u: upload heatmap (obsolete soon)
         * @param e: mouse event
         */
        onKeyDown: function (e) {
            e.preventDefault();
            if (e.keyCode == 83 && App.myRole =='Host'){ //s: selection
                App.SELECT = true;
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
                App.SELECT = false;
                App.$bar.removeClass('active');
            }
        },

        /**
         *
         */
        showList: function(){
            $.post('/getObjectList',{},function(data){
                $.each(data, function(i,d){
                    $("#objlist").append("<div class='object_div btn' id="
                    + d.id + ">" + "<a>" + d.object_name + "</a></div> ");
                })
            })
        },



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
                    App.onSubmitAnswer();
                }
                else{
                }
            }
        },

        // method invoked if the user clicks on a geometry while pressing s
        select: function () {
            if (App.selection_capacity > 0) { // if still can select

                //casts a ray from camera through mouse at object
                Obj.object_set[0].raycaster.setFromCamera(App.mouse, Obj.object_set[0].camera);
                App.selectedStrings = []; //initialized the selectedStrings array as empty
                var intersections = []; //creates a empty intersection array as multiple selection are possible --
                // raycaster might intersect more than one face such as at the front and back of a geometry

                //attempts to make an intersection
                try {
                    intersections = Obj.object_set[0].raycaster.intersectObjects(Obj.object_set[0].scene.children[0].children);
                } catch (e) {
                    intersections[0] = null;
                }

                //stores the first (closest) intersection
                var intersection = ( intersections.length ) > 0 ? intersections[0] : null;


                if (intersection != null) {
                    //sends the 3 vertex indices of the selected faces so the neighboring faces can be found
                    //this is done without looping
                    if (Obj.object_set[0].object.getObjectByName(intersection.object.name).allSelectedID.indexOf(intersection.faceIndex) == -1) {
                        Obj.object_set[0].selectNeighboringFaces3(
                            Obj.object_set[0].scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].a,
                            Obj.object_set[0].scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].b,
                            Obj.object_set[0].scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex, intersection.object.name);

                        // the returned faces are filtered for only unique faces
                        App.selectedStrings = App.selectedStrings.filter(App.onlyUnique);

                        // the unique faces are compared to the faces that had previusly been selected
                        App.selectedStrings = App.diff(App.selectedStrings, Obj.object_set[0].object.getObjectByName(intersection.object.name).allSelectedID); // only emit new selection


                        $.each(App.selectedStrings, function (i, SS) {
                            Obj.object_set[0].object.getObjectByName(intersection.object.name).allSelectedID.push(SS);
                        });


                        // Max code for encoding face ids from different meshes
                        var mesh_id = parseInt(intersection.object.name);
                        var bias = 0;
                        for (var i = 0; i < mesh_id; i++) {
                            bias += Obj.object_set[0].object.FaceArray[i];
                        }
                        var uniqueValues = [];
                        $.each(App.selectedStrings, function (i, s) {
                            uniqueValues.push(s + bias);
                        });


                        $.each(uniqueValues, function (i, UV) {
                            App.allSelectedIDMaster.push(UV);
                        });

                        App.selectedStrings.unshift(parseInt(intersection.object.name));
                        App.selection_capacity = App.selection_capacity - App.selectedStrings.length + 1;
                        App.$bar.css('opacity', App.selection_capacity / 1000 * App.progressbar_size);

                        IO.socket.emit('selection', JSON.stringify(App.selectedStrings));
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
        },


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

            IO.socket.emit('joinGame');

            // Set the appropriate properties for the current player.
            App.myRole = 'Player';
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
                correct: $.inArray(answer.toLowerCase(), [Obj.object_set[0].correct_answer])>=0,
                round: App.currentRound,
                duration: Date.now()-App.start_obj_time, // time from start of the object
                score: App.score,
                object_name: Obj.object_set[0].object.name,
                all_selected_id: JSON.stringify(App.allSelectedIDMaster)
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

    // Anything associated with the scene and objects in it can be accessed under GAME.Obj
    var Obj = {
        object_set: [],

        //creates the scene
        object_scene: function(){
            //
            this.object_id = [];
            this.camera = [];
            this.raycaster = [];
            this.scene = [];
            this.object = [];
            this.emptyobject = []; // for the hidden obj on the player's side
            this.renderer = [];
            this.correct_answer = '';
            this.theta = 0; // camera angle x
            this.beta = 0; // camera angle y
            this.radius = 1500;
            this.height = [];
            this.scale = [];
            var d = this;

            //for background pics
            this.createTextureCube = function() {
                var r = "textures/bridge/";
                var urls = [ r + "posx.jpg", r + "negx.jpg",
                    r + "posy.jpg", r + "negy.jpg",
                    r + "posz.jpg", r + "negz.jpg" ];

                var textureCube = THREE.ImageUtils.loadTextureCube( urls );
                textureCube.format = THREE.RGBFormat;
                textureCube.mapping = THREE.CubeReflectionMapping;
                return textureCube;
            };

            // creates lighting
            this.createLights = function() {
                var ambient = new THREE.AmbientLight( 0x020202 );
                d.scene.add( ambient );

                var directionalLight1 = new THREE.DirectionalLight( 0xffffff );
                directionalLight1.position.set( d.camera.position.z + 50, d.camera.position.y, - d.camera.position.x );//.normalize();

                var directionalLight2 = new THREE.DirectionalLight( 0xffffff );
                directionalLight2.position.set( 1000, 500,-1000 );//.normalize();
                d.scene.add( directionalLight1 );
                d.scene.add( directionalLight2 );
            },

            /**
             * create mesh faces on the player side
             * @param selection: current face ids from meshes
             * @param childnumber: current mesh id
             */
                this.createMesh = function(selection, childName ) {
                    //var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} );

                    //update all selected face id, encoded by childname
                    var mesh_id = parseInt(childName);
                    var bias = 0;
                    for(var i=0;i<mesh_id;i++){
                        bias += d.object.FaceArray[i];
                    }
                    var uniqueValues = [];
                    $.each(selection, function (i,s) {
                        uniqueValues.push(s+bias);
                    });
                    App.allSelectedIDMaster = App.allSelectedIDMaster.concat(uniqueValues);

                    $.each(selection, function (i, s) {


                        var geom = new THREE.Geometry();
                        var f = d.object.getObjectByName(childName).geometry.faces[s];
                        var v1 = d.object.getObjectByName(childName).geometry.vertices[f.a];
                        var v2 = d.object.getObjectByName(childName).geometry.vertices[f.b];
                        var v3 = d.object.getObjectByName(childName).geometry.vertices[f.c];
                        geom.vertices.push(v1, v2, v3);

                        var nf = new THREE.Face3(0, 1, 2);
                        nf.vertexNormals = f.vertexNormals;
                        nf.normal = f.normal;
                        geom.faces.push(nf);

                        var mesh = new THREE.Mesh(geom, d.object.getObjectByName(childName).material);

                        mesh.rotation.x = d.object.getObjectByName(childName).rotation.x;
                        mesh.rotation.y = d.object.getObjectByName(childName).rotation.y;
                        mesh.rotation.z = d.object.getObjectByName(childName).rotation.z;

                        mesh.scale.set(d.scale, d.scale, d.scale);
                        mesh.castShadow = true;


                        if (d.object.CG_emptyObj != undefined) {
                            mesh.position.x =  d.object.CG_emptyObj[0];
                            mesh.position.y =  d.object.CG_emptyObj[1];
                            mesh.position.z =  d.object.CG_emptyObj[2];
                        } else {
                            mesh.position.x = 0;
                            mesh.position.y = 0;
                            mesh.position.z = 0;
                        }
                        d.emptyobject.add(mesh);
                    });
                };

            /**
             * 3rd iteration of the mesh selection algorithm, works in conjunction
             * with the second version
             * @param a
             * @param b
             * @param c
             * @param iteration
             * @param faceindex
             * @param name
             * This program looks at vertices that get fed in and look for the faces that have these vertices as part of
             * their definition
             */

            this.selectNeighboringFaces3 = function(a,b,c,iteration,faceindex, name) {
                for (var i=0; i<13; i++) {
                    if (d.object.getObjectByName(name).sorted[1][i][a] != undefined) {
                        if (iteration!=0) {
                            d.selectNeigboringFaces2(
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][a]].a,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][a]].b,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][a]].c,
                                iteration-1,d.object.getObjectByName(name).sorted[1][i][a], name);
                        }

                    }

                    if (d.object.getObjectByName(name).sorted[1][i][b] != undefined) {
                        if (iteration!=0) {

                            d.selectNeigboringFaces2(
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][b]].a,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][b]].b,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][b]].c,
                                iteration-1,d.object.getObjectByName(name).sorted[1][i][b], name);
                        }
                    }


                    if (d.object.getObjectByName(name).sorted[1][i][c] != undefined) {
                        if (iteration!=0) {

                            d.selectNeigboringFaces2(
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][c]].a,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][c]].b,
                                d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[1][i][c]].c,
                                iteration-1,d.object.getObjectByName(name).sorted[1][i][c], name);
                        }
                    }
                }
            };

            /**
             * 2nd iteration of the selection algorithm that works with the 3rd
             * @param a
             * @param b
             * @param c
             * @param iteration
             * @param faceIndex
             * @param name
             */
            this.selectNeigboringFaces2 = function(a, b, c, iteration, faceIndex, name) {

                App.selectedStrings.push(faceIndex);

                if (d.object.getObjectByName(name).sorted[0][0][a] == faceIndex) {
                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][1][a]].a,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][1][a]].b,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][1][a]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][1][a])
                    }
                } else if (d.object.getObjectByName(name).sorted[0][1][a] == faceIndex) {
                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].a,
                            d.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].b,
                            d.object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][0][a])
                    }

                }

                if (d.object.getObjectByName(name).sorted[0][2][b] == faceIndex) {
                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][3][b]].a,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][3][b]].b,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][3][b]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][3][b])
                    }
                } else if (d.object.getObjectByName(name).sorted[0][3][b] == faceIndex) {
                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][2][b]].a,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][2][b]].b,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][2][b]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][2][b])
                    }

                }

                if (d.object.getObjectByName(name).sorted[0][4][c] == faceIndex) {

                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][5][c]].a,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][5][c]].b,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][5][c]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][5][c])
                    }
                } else if (d.object.getObjectByName(name).sorted[0][5][c] == faceIndex) {
                    if (iteration != 0) {
                        d.selectNeigboringFaces2(
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][4][c]].a,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][4][c]].b,
                            d.object.getObjectByName(name).geometry.faces[d.object.getObjectByName(name).sorted[0][4][c]].c, iteration - 1, d.object.getObjectByName(name).sorted[0][4][c])
                    }

                }
            };


            this.animate = function() {
                requestAnimationFrame(d.animate);
                d.render();
            };


            this.render = function() {
                if(App.myRole != 'Player'){
                    if(typeof(d.object)!='undefined'){

                        d.object.rotation.set( Math.max(-Math.PI/6,Math.min(d.object.rotation.x - d.beta, Math.PI/6)),
                            d.object.rotation.y + d.theta, 0, 'XYZ' );
                    }
                }
                else{
                    if(typeof(d.emptyobject)!='undefined'){
                        d.emptyobject.rotation.set( Math.max(-Math.PI/6,Math.min(d.emptyobject.rotation.x - d.beta, Math.PI/6)),
                            d.emptyobject.rotation.y + d.theta, 0, 'XYZ' );
                    }
                }

                d.camera.position.x = 0;
                d.camera.position.y = d.height; //don't change
                d.camera.position.z = d.radius;

                if (App.VRMODE){
                    d.headControls.update();
                    d.vrEffect.render( d.scene, d.camera );
                }
                else{
                    d.renderer.render( d.scene, d.camera);
                    if(typeof(d.object.getObjectByName("selectable"))!='undefined'){
                        d.object.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
                    }
                }

                // countdown when object is shown
                App.$timebar.css('opacity',1-(Date.now()-App.currentTime)/App.totalTime/60000);
                if (1-(Date.now()-App.currentTime)/App.totalTime/60000<=0){
                    IO.gameOver();
                }
            };

            this.paint_faces = function () {
                //this function paints the faces in a defined color pattern. This has to do with the saliency files that
                // are loading in.
                $.each(d.object.children[0].geometry.faces, function(i,f){
                    //col = d.getRGB(1/3*(
                    //    d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].a].salColor,
                    //    d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].b].salColor,
                    //    d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].c].salColor));

                    var col = Obj.getRGB((d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].a].salColor+
                    d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].b].salColor+
                    d.object.children[0].geometry.vertices[d.object.children[0].geometry.faces[i].c].salColor)/3.0);

                    //if (w>0){
                    //    d.object.children[0].geometry.faces[i].color.r = Math.min(w+0.5,1.0);
                    //    d.object.children[0].geometry.faces[i].color.g = 0.5;
                    //    d.object.children[0].geometry.faces[i].color.b = 0.5;
                    //}

                    d.object.children[0].geometry.faces[i].color.r = col[0]/255;
                    d.object.children[0].geometry.faces[i].color.g = col[1]/255;
                    d.object.children[0].geometry.faces[i].color.b = col[2]/255;
                });

                d.object.children[0].geometry.colorsNeedUpdate = true;
            };
        },

        //
        init: function(target, callback) {
            var container = target[0];
            var o = new Obj.object_scene();
            o.camera = new THREE.PerspectiveCamera( 70, target.width() / target.height(), 1, 10000 );
            o.scene = new THREE.Scene();
            var background = new THREE.Scene();
            background.name = "background";
            o.createTextureCube();
            o.object = THREE.SceneLoad(callback);
            //o.object.name = o.correct_answer[0]; // use the first answer as the object name

            if(App.myRole=='Player'){
                o.emptyobject = new THREE.Scene();
                o.emptyobject.name = "emptyobject";
                o.emptyobject.castShadow  = true;
                o.scene.add(o.emptyobject);
            }
            else{
                o.object.castShadow  = true;
                o.scene.add(o.object);

            }

            o.camera.position.x = -o.radius;
            o.camera.position.y = o.height; //don't change
            o.camera.position.z = 0;

            o.createLights();

            o.raycaster = new THREE.Raycaster();

            o.renderer = new THREE.WebGLRenderer( { antialias: true } );
            o.renderer.setPixelRatio( window.devicePixelRatio );

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

            o.renderer.setClearColor( 0xeeeeee );
            o.renderer.setSize( target.width(), target.height());
            o.renderer.sortObjects = false;
            container.appendChild( o.renderer.domElement );
            Obj.object_set.push(o);
            return o;
        },

        showHeatmap: function(id,method,target,callback) {
            $.get('/getRawObjectList', function(response) {
                App.objectstring_set = response.objectstring_set;
                App.objectString = App.objectstring_set[id];
                $.getScript(App.objectString, function () {
                    var inner_callback = function(){
                        var weight = new Array(o.object.FaceArray.length);
                        $.each(weight, function (i, e) {
                            weight[i] = new Array(o.object.children[i].geometry.faces.length);
                        });

                        if (method == 0) { // our method
                            var raw_face_id_array, mesh_id, face_id, max_weight, count;
                            $.post('/read_selection', {'object_name': o.object.name}, function (response) {
                                    $.each(response, function (i, r) {
                                        raw_face_id_array = r.all_selected_id;
                                        $.each(raw_face_id_array, function (j, raw_face_id) {
                                            mesh_id = 0;
                                            face_id = raw_face_id;
                                            count = 0;
                                            while (face_id - o.object.FaceArray[count] >= 0) {
                                                face_id -= o.object.FaceArray[count];
                                                mesh_id++;
                                                count++;
                                            }
                                            if (typeof weight[mesh_id][face_id] == 'undefined') {
                                                weight[mesh_id][face_id] = 1;
                                            }
                                            else {
                                                weight[mesh_id][face_id] += 1;
                                            }
                                        })
                                    });

                                    max_weight = [];
                                    $.each(weight, function (i, w_mesh) {
                                        max_weight.push(Math.max.apply(null, w_mesh.filter(function (x) {
                                            return isFinite(x);
                                        })));
                                    });
                                    var max_max_weight = Math.max.apply(Math, max_weight);
                                    $.each(weight, function (mesh_id, face_for_mesh) {
                                        $.each(face_for_mesh, function (face_id, w) {
                                            if (w) {
                                                if (face_id >= o.object.children[mesh_id].geometry.faces.length) {
                                                    var stop = 1;
                                                }
                                                o.object.children[mesh_id].geometry.faces[face_id].color.r = Math.max(w / max_max_weight, 0.7);
                                                o.object.children[mesh_id].geometry.faces[face_id].color.g = Math.max(w / max_max_weight / 5.0, 0.2);
                                                o.object.children[mesh_id].geometry.faces[face_id].color.b = Math.max(w / max_max_weight / 5.0, 0.2);
                                            }
                                        });
                                        o.object.children[mesh_id].geometry.colorsNeedUpdate = true;
                                    });
                                    if (typeof(callback) != 'undefined'){
                                        callback();
                                    }
                                }
                            );
                        }
                        else if (method == 1) { // use saliency distribution data from Chen 2012
                            // extract from objectString the saliency index. Note that the actual number starts from the 15th character.
                            var saliency_distribution_id = parseInt(App.objectString.replace(/^\D+|\D+$/g, ""));
                            $.get('obj/Princeton_saliency_distribution_Chen/' + saliency_distribution_id + '.val', function (response) {
                                response = response.split('\n');
                                if (response[response.length-1]==''){response = response.splice(0,response.length-1);}
                                $.each(response, function (i, r) {
                                    response[i] = parseFloat(r);
                                });
                                var max_weight = Math.max.apply(Math, response);
                                $.each(response, function (i, r) {
                                    o.object.children[0].geometry.vertices[i].salColor = r/max_weight;
                                });

                                o.paint_faces();
                                if (typeof(callback) != 'undefined'){
                                    callback();
                                }
                            });
                        }
                    };
                    var o = Obj.init(target,inner_callback);
                    o.animate();
                });
            });
        },

        /**
         * ONLY used initially offline before any game
         */
        initial_obj: function (id) {
            $.get('/getRawObjectList', function(response){
                App.objectstring_set = response.objectstring_set;
                var obj = App.objectstring_set[id];
                $.getScript(obj, function () {
                    THREE.SceneLoad(function(){
                        console.log('storing obj to database...');
                        $.post('/initial_obj', {
                                'object_name': THREEScene.name,
                                'face_per_mesh': JSON.stringify(THREEScene.FaceArray),
                                'num_selections': ""
                            }, function(){
                                if (id<App.objectstring_set.length-1){
                                    Obj.initial_obj(id + 1);
                                }
                            }
                        );
                    });
                });
            });
        },

        //this funciton returns a rgb value on a linear scale between min and max. This is usefull for creating heat maps
        getRGB: function(val) {
            var min = 0.0;
            var max = 1.0;

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

