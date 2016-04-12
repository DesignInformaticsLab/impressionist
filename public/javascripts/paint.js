/**
 * Created by p2admin on 3/20/2016.
 */
/**
 * Created by Max Yi Ren on 3/7/2015.
 */

//TODO: mesh selection is still too slow
//TODO: scale, height and centering are not the same for object and emptyobject
//TODO: moving from one round to the next needs some polish
//TODO: score and timer needs to be exciting

var GAME = (function($){
    'use strict';
    var game = {};

    /**
     * IO has all the code relevant to Socket.IO.
     */
    var IO = {
        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect(); // initialize the socket
            IO.bindEvents();
            IO.getSocketStats(); // get number of total players
        },

        // on player selection: combined the two codes together, not sure why we had two...
        onSelection: function(sig){
            if(Obj.object_set[0].object != undefined) { // if model exists
                var selections = JSON.parse(sig);
                var childName = selections.shift().toString(); // use childName only when the object contains multiple meshes
                $.each(selections, function(id,i){
                    Obj.object_set[0].object.getObjectByName(childName).geometry.faces[i].color.setHex(0x0003FF);
                });
                Obj.object_set[0].object.getObjectByName(childName).geometry.colorsNeedUpdate = true;
            }
        },

        /**
         * When the other player is ready
         * @param data
         */
        onPlayerReady : function(objectId) {
            App.$wait.hide();
            App.$game.show();

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
                        App.selection_capacity = Obj.object_set[0].object.FaceArray[0]; // assign player selection capacity for current obj
                        App.numSelectedFaces = Obj.object_set[0].object.FaceArray[0];
                        o.correct_answer = answer; // get correct answers
                        o.height = zheight;
                        o.scale = scale;

                        if(App.myRole == 'Player'){
                            App.$menu.show();
                            App.$guessoutput.hide();
                            App.$guessinput.show();
                            App.$guessinput[0].value='';
                            App.SELECT = false;
                        }
                        else if(App.myRole == 'Host'){
                            App.$menu.show();
                            App.$guessoutput.show();
                            App.$guessoutput[0].value='';
                            App.$guessinput.hide();
                        }
                        o.object.rotation.y = Math.random()*Math.PI*2;

                        // show object when everything is ready
                        App.$wait.fadeOut();
                        App.object_loaded = true;
                        o.animate();
                    }
                }
                App.$model.html('');
                var o = Obj.init(target, callback);
                App.$model.focus(); // focus on $model so that key events can work
                o.render(); // just render once
            });
        },

        // response to new object grabbed during human-computer games
        onObjectGrabbed: function (data){
            App.objectString = data.objectAdd;
            // create a new object and start the game
            Obj.object_set = [];
            App.$game.show();
            IO.onNewObjData(App.$model, callback);
            App.$model.focus(); // focus on $model so that key events can work
        },
    };

    var App = {
        /* *************************************
         *                Setup                *
         * *********************************** */
        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.setInitParameter();
            App.cacheElements();
            App.bindEvents();
            App.showInitScreen();
        },

        /**
         * Initial parameters
         */
        setInitParameter: function () {
            /**
             * Use VR mode or not
             */
            App.VRMODE = false;

            /**
             * mouse location
             */
            App.mouse = [];

            /**
             * if mouse left button is down
             */
            App.PRESSED = false;

            /**
             * Object string contains all objects
             */
            App.objectstring_set = [];

            /**
             * all selected face ID for the current object
             */
            App.allSelectedIDMaster = [];

            /**
             * current selected face ID
             */
            App.selectedStrings = [];

            /**
             * if in the selection mode
             */
            App.SELECT = false;

            /**
             * All face ID for the current object
             */
            App.allSelectedID = [];

            /**
             * object rendering on or off
             */
            App.rendering = [false, false];
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
            App.$score= $('#score');
            App.$guessoutput = $('#guessoutput');
            App.$guessinput = $('#guessinput');
            App.$menu = $('#menu');
            //App.$bar = $('#bar');
            //App.$select = $('#select');
            App.$time = $('#time');
            App.$timebar = $('#timebar');
            App.$entry = $('#entry');
            App.$tutorial = $('#tutorial');
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
            //App.$stat_btn = $($('li')[2]);
            App.$stat_btn = $($('a')[4]);
            App.$stat_btn.css('cursor','pointer');

            // instruction
            App.$instruction = $('#instruction');
            //App.$rotate = $('#rotate');
            App.$rotation_left = $('#rotate.rt_left');
            App.$rotation_right = $('#rotate.rt_right');
            App.$rotation_up = $('#rotate.rt_up');
            App.$rotation_down = $('#rotate.rt_down');
            //App.$zoom_bigger = $('#zoom.bigger');
            //App.$zoom_smaller = $('#zoom.smaller');

            // scoreboard
            App.$myscore = $('#myscore');
            App.$myrank = $('#myrank');
            App.$scoreboard= $('#scoreboard');
            App.$amt = $('#amt');
            App.$scoreboard.on('hidden.bs.modal', function () {
                App.gameOver();
            });
            var margin_left = (App.$game.width()-App.$guessinput.width())*.5;
            var menu_bottom = $('.mastfoot').height();
            App.$menu.css('bottom',menu_bottom+'px');
            App.$objlist.css('bottom',menu_bottom+'px');
            App.$guessoutput.css('marginLeft',margin_left+'px');
            App.$guessinput.css('left',margin_left+'px');
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host and Player
            App.$model.mousemove(function (e) {
                App.onMouseMove(e, App.$model)
            });
            App.$model.mousedown(function (e) {
                App.onMouseDown(e, App.$model)
            });
            App.$model.mouseup(function (e) {
                App.onMouseUp(e, App.$model)
            });
            App.$model.keyup(function (e) {
                App.onKeyUp(e, App.$model)
            });
            App.$model.keydown(function (e) {
                App.onKeyDown(e, App.$model)
            });
            App.$comp_model1.mousemove(function (e) {
                App.onMouseMove(e, App.$comp_model1)
            });
            App.$comp_model1.mousedown(function (e) {
                App.onMouseDown(e, App.$comp_model1)
            });
            App.$comp_model1.mouseup(function (e) {
                App.onMouseUp(e, App.$comp_model1)
            });
            App.$comp_model2.mousemove(function (e) {
                App.onMouseMove(e, App.$comp_model2)
            });
            App.$comp_model2.mousedown(function (e) {
                App.onMouseDown(e, App.$comp_model2)
            });
            App.$comp_model2.mouseup(function (e) {
                App.onMouseUp(e, App.$comp_model2)
            });

            // virtual mouse
            App.$model.bind('vmousemove', function (e) {
                App.onMouseMove(e, App.$model)
            });
            App.$model.bind('vmousedown', function (e) {
                App.onMouseDown(e, App.$model)
            });
            App.$model.bind('vmouseup', function (e) {
                App.onMouseUp(e, App.$model)
            });
            App.$model.keyup(function (e) {
                App.onKeyUp(e, App.$model)
            });
            App.$model.keydown(function (e) {
                App.onKeyDown(e, App.$model)
            });
            App.$comp_model1.bind('vmousemove', function (e) {
                App.onMouseMove(e, App.$comp_model1)
            });
            App.$comp_model1.bind('vmousedown', function (e) {
                App.onMouseDown(e, App.$comp_model1)
            });
            App.$comp_model1.bind('vmouseup', function (e) {
                App.onMouseUp(e, App.$comp_model1)
            });
            App.$comp_model2.bind('vmousemove', function (e) {
                App.onMouseMove(e, App.$comp_model2)
            });
            App.$comp_model2.bind('vmousedown', function (e) {
                App.onMouseDown(e, App.$comp_model2)
            });
            App.$comp_model2.bind('vmouseup', function (e) {
                App.onMouseUp(e, App.$comp_model2)
            });
            App.$model.bind('mousewheel DOMMouseScroll vmousehweel', function (event) {
                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                    // scroll up
                    Obj.object_set[0].global_scale += 0.1;
                    Obj.object_set[0].global_scale = Math.min(1.5, Obj.object_set[0].global_scale);
                }
                else {
                    // scroll down
                    Obj.object_set[0].global_scale -= 0.1;
                    Obj.object_set[0].global_scale = Math.max(0.8, Obj.object_set[0].global_scale);
                }
            });


            window.addEventListener('resize', App.onWindowResize, false);

            window.addEventListener('load', function () {

                var box1 = document.getElementById('model')

                box1.addEventListener('touchstart', function (e) {
                    var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
                    var modeltopmargin = Number(App.$model.css('margin-top').slice(0, -2)) || 0;
                    var modelleftmargin = Number(App.$model.css('margin-left').slice(0, -2)) || 0;
                    var posx = ( (touchobj.clientX - modelleftmargin) / App.$model.width()) * 2 - 1;
                    var posy = -( (touchobj.clientY - modeltopmargin) / App.$model.height() ) * 2 + 1;
                    //$(' h3').html('x: ' + posx + 'y:' + posy);
                    var pos = [posx, posy];
                    e.preventDefault();
                    App.select(pos);
                }, false);

                box1.addEventListener('touchmove', function (e) {
                    var touchobj = e.changedTouches[0] // reference first touch point for this event
                    var modeltopmargin = Number(App.$model.css('margin-top').slice(0, -2)) || 0;
                    var modelleftmargin = Number(App.$model.css('margin-left').slice(0, -2)) || 0;
                    var posx = ( (touchobj.clientX - modelleftmargin) / App.$model.width()) * 2 - 1;
                    var posy = -( (touchobj.clientY - modeltopmargin) / App.$model.height() ) * 2 + 1;
                    //$(' h3').html('x: ' + posx + 'y:' + posy);
                    var pos = [posx, posy];
                    e.preventDefault()
                    App.select(pos);
                }, false)

                box1.addEventListener('touchend', function (e) {
                    var touchobj = e.changedTouches[0] // reference first touch point for this event
                    var modeltopmargin = Number(App.$model.css('margin-top').slice(0, -2)) || 0;
                    var modelleftmargin = Number(App.$model.css('margin-left').slice(0, -2)) || 0;
                    var posx = ( (touchobj.clientX - modelleftmargin) / App.$model.width()) * 2 - 1;
                    var posy = -( (touchobj.clientY - modeltopmargin) / App.$model.height() ) * 2 + 1;
                    //$(' h3').html('x: ' + posx + 'y:' + posy);
                    var pos = [posx, posy];
                    e.preventDefault()
                    App.select(pos);
                }, false)

            }, false)
        },

        onWindowResize: function() {
            // interface
            var margin_left = (App.$game.width()-App.$guessinput.width())*.5;
            var menu_bottom = $('.mastfoot').height();
            App.$menu.css('bottom',menu_bottom);
            App.$objlist.css('bottom',menu_bottom);
            //App.$score.css('marginLeft',margin_left+'px');
            App.$guessoutput.css('marginLeft',margin_left+'px');
            App.$guessinput.css('left',margin_left+'px');

            $.each(Obj.object_set, function(i,o){
                if (Obj.object_set.length == 1){
                    o.camera.aspect = App.$model.width() / App.$model.height();
                    o.camera.updateProjectionMatrix();
                    o.renderer.setSize(App.$model.width(), App.$model.height());
                }
                else if (Obj.object_set.length == 2){
                    o.camera.aspect = App.$comp_model1.width() / App.$comp_model1.height();
                    o.camera.updateProjectionMatrix();
                    o.renderer.setSize(App.$comp_model1.width(), App.$comp_model1.height());

                    o.camera.aspect = App.$comp_model2.width() / App.$comp_model2.height();
                    o.camera.updateProjectionMatrix();
                    o.renderer.setSize(App.$comp_model2.width(), App.$comp_model2.height());
                }

                /* if (VRMODE) {
                 Obj.vrEffect.setSize(window.innerWidth, window.innerHeight);
                 }
                 else {*/
                //o.renderer.setSize(App.$model.width(), App.$model.height());
                //}
            });
        },

        /**
         * when mouse move, change view and do select() when SELECT is true
         * @param e: mouse event
         */
        onMouseMove: function (e, target) {
            e.preventDefault();

            //if(App.is_touch_device()){
            //    var posx = e.changedTouches[0].clientX
            //    var posy = e.changedTouches[0].clientY
            //    //var posx = e.originalEvent.touches[0].pageX;
            //    //var posy = e.originalEvent.touches[0].pageY;
            //}else
            {
                var posx = e.pageX
                var posy = e.pageY
            }


            var tempx = App.mouse.x;
            var tempy = App.mouse.y;

            // $model margins
            App.modeltopmargin = Number(App.$model.css('margin-top').slice(0,-2))||0;
            App.modelleftmargin = Number(App.$model.css('margin-left').slice(0,-2))||0;

            App.mouse.x = ( (posx-App.modelleftmargin) / target.width()) * 2 - 1;
            App.mouse.y = - ( (posy-App.modeltopmargin) / target.height() ) * 2 + 1;
            if (App.PRESSED == true){
                if (App.SELECT == true && (App.myRole == 'Host'||!App.tutorial_shown)) {
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

            if(App.is_touch_device()){
                var posx = e.changedTouches[0].clientX
                var posy = e.changedTouches[0].clientY
                //var posx = e.originalEvent.touches[0].pageX;
                //var posy = e.originalEvent.touches[0].pageY;
            }else{
                var posx = e.pageX
                var posy = e.pageY
            }

            if (!App.isJqmGhostClick(event)) {

                // $model margins
                App.modeltopmargin = Number(App.$model.css('margin-top').slice(0,-2))||0;
                App.modelleftmargin = Number(App.$model.css('margin-left').slice(0,-2))||0;

                App.PRESSED = true;
                if (App.PRESSED == true && App.SELECT == true) {
                    App.mouse.x = ( (posx-App.modelleftmargin) / target.width() ) * 2 - 1;
                    App.mouse.y = -( (posy-App.modeltopmargin) / target.height() ) * 2 + 1;
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

        onKeyDown: function (e) {
            e.preventDefault();
            if (App.tutorial_shown==false){
                if (App.myRole == 'Host' && e.keyCode == 83) { //s: selection
                    App.SELECT = true;
                    App.$game.addClass('active');
                }
            }
            else{
                if (App.myRole == 'Host' && e.keyCode == 83) { //s: selection
                    App.SELECT = true;
                    //App.$bar.addClass('active');
                    App.$game.addClass('active');
                    if (App.myRole == 'Host') {
                        //$('#wait.inner.cover p.lead').html('<b>Be aware, select more face will reduce your time!');
                        //App.$wait.show();
                        //$('#instruction p').html('<b>Be aware, select more faces will reduce your time!</b>');
                        //setTimeout(function () { App.$wait.hide()}, 1500);
                    }
                }else{
                    if (App.myRole == 'Host') {
                        //$('#instruction p').html('<b>Press S key to select');
                    }
                }
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
            if (App.myRole == 'Host'){
                if (e.keyCode == 83){
                    App.SELECT = false;
                    App.$game.removeClass('active');
                }
                //$('#instruction p').html('');
            }
        },

        // method invoked if the user clicks on a geometry while pressing s
        select: function (pos) {
            if (App.selection_capacity > 0) { // if still can select
                if (App.is_touch_device()){
                    App.mouse.x = pos[0]
                    App.mouse.y = pos[1]
                }
                //casts a ray from camera through mouse at object
                Obj.object_set[0].raycaster.setFromCamera(App.mouse, Obj.object_set[0].camera);


                //var projector = new THREE.Projector();
                //Obj.object_set[0].raycaster = projector.pickingRay( App.mouse, Obj.object_set[0].camera );

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
                            ////temporary for debugging only
                            //if (SS>=Obj.object_set[0].object.FaceArray[0]){
                            //    var holdon = 1;
                            //}

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
                        //App.$bar.css('opacity', App.selection_capacity / Obj.object_set[0].object.FaceArray[0] * App.progressbar_size);

                        // if tutorial
                        if (!App.tutorial_shown){
                            var selections = App.selectedStrings;
                            var childName = selections.shift().toString(); // use childName only when the object contains multiple meshes
                            $.each(selections, function(id,i){
                                Obj.object_set[0].object.getObjectByName(childName).geometry.faces[i].color.setHex(0xff7777);
                            });
                            Obj.object_set[0].object.getObjectByName(childName).geometry.colorsNeedUpdate = true;
                        }
                        // if real game
                        else{
                            IO.socket.emit('selection', JSON.stringify(App.selectedStrings));
                        }
                    }
                }
            }
        },


        /**
         * Let everyone know the game has ended.
         * @param data
         */
        gameOver : function() {
            //App.refresh();
            //$.each(Obj.object_set, function(i,o){
            //    o.desposeMesh();
            //});
            App.quit();
            App.$home.show();
            $('.mastfoot').show();
            App.$wait.hide();
            App.$stat.hide();
            App.$game.hide();
            App.$home_btn.addClass('active');
            App.$game_btn.removeClass('active');
            App.$stat_btn.removeClass('active');
            IO.getSocketStats();
        },

        // show score board and submit game score
        showScoreBoard: function(){
            $.post('/getTotalNumber', {'amt':App.amt}, function(response){
                var totalplays = response[0].count;
                $.post('/getRanking',{'score':App.currentRound,'amt':App.amt},function(response){
                    var worse = response.result[0].count;
                    var survived = Math.round((Date.now() - App.startingTime)/1000*10)/10;
                    $('h4.modal-title').html('Congratulations! You survived ' + survived + ' seconds in the game!');
                    App.$myrank.html('You are now better than '+Math.round(worse/totalplays*100.0)+'% of all players!');
                    //App.$myscore.html('You identified '+App.currentRound+' object(s)!<br>');
                    if(App.amt){ // show amt code for amt users
                        if(App.currentRound>2){
                            $.post('/getamtcode',{'score':App.currentRound},function(response){
                                App.$amt.html('YOUR MTURK CODE:' + response);
                            });
                        }
                        else{
                            App.$amt.html('Try to make three correct guesses to get the MTURK code!');
                        }
                    }
                    App.$scoreboard.modal();
                });
            });
        },

        /**
         * Click handler for the 'JOIN' button
         */
        onJoinClick: function () {
            // console.log('Clicked "Join A Game"');

            // Display the Join Game HTML on the player's screen.
            //App.$gameArea.html(App.$templateJoinGame);

            console.log('Try finding a player...');

            IO.socket.emit('joinGame');
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

                correct: $.inArray(answer.toLowerCase(), Obj.object_set[0].correct_answer)>=0,
                round: App.currentRound,
                duration: Date.now()-App.start_obj_time, // time from start of the object
                score: Math.round(App.game_score),
                object_name: Obj.object_set[0].object.name,
                all_selected_id: JSON.stringify(App.allSelectedIDMaster),
                computer_player: 0,
                //weight: JSON.stringify(weight)
                amt: App.amt,
                penalty: JSON.stringify([App.is_touch_device()+0.0]) // use penalty to save whether the device is mobile or not, 1 if mobile
            };
            if (App.playWithComputer){data.computer_player=1;}

            // if during a real game
            if (App.tutorial_shown){
                $.post('/store_selection',data,function(){
                    IO.socket.emit('checkAnswer',data);
                });
            }
            // if during tutorial
            else{
                var correct = $.inArray(answer.toLowerCase(), Obj.object_set[0].correct_answer)>=0;
                if (correct){
                    App.object_loaded = false;
                    IO.onAnswerCorrect();
                }
                else{
                    IO.onAnswerWrong();
                }
            }
        },

        /**
         * celebrate correct answers
         * @param callback
         */
        celebrate: function(callback){
            $('#wait.inner.cover p.lead').html('Bingo! You get extra time!');
            App.$wait.show();
            setTimeout(callback,1000);
        },

        /**
         * Play with computer if no human players available
         */
        playComputer: function() {
            App.gameId = -2; // -2 for playing with a computer outside of a tutorial
            $('#wait.inner.cover p.lead').html('A computer is joining the game...');
            App.playWithComputer = true;
            App.myRole = 'Player';
            //App.$select.hide();
            //App.$bar.hide();
            //App.playWithComputer = false;
            IO.socket.emit('grabBestObject');
        },

        /**
         * The computer automatically selects meshes to show
         */
        autoSelect: function (){
            // reveal meshes at a fixed rate
            // TODO: change the rate depending on the total mesh size
            var o = Obj.object_set[0];
            App.autoSelecting = setInterval(function(){
                var selection = o.faceSaliency.sortIndices.pop();
                o.createMesh([selection],"0");
            }, 50);
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
        },

        isClickingCrazy: function(event) {
            var currTapTime = new Date().getTime();
            if(App.lastTapTime == null || currTapTime > (App.lastTapTime + 1000)) {
                App.lastTapTime = currTapTime;
                return false;
            }
            else {
                return true;
            }
        },

        //merge: function(left, right){
        //    var result = [],
        //        lLen = left.length,
        //        rLen = right.length,
        //        l = 0,
        //        r = 0;
        //    while(l < lLen && r < rLen){
        //        if(left[l] < right[r]){
        //            result.push(left[l++]);
        //        }else if (left[l] == right[r]){
        //            var idx = Math.floor(Math.random() * 2);
        //            if (idx > 1) {
        //                return left[l++];
        //            }else {
        //                return right[r++];
        //            }
        //        }else{
        //            result.push(right[r++]);
        //        }
        //    }
        //    //remaining part needs to be addred to the result
        //    return result.concat(left).concat(right);
        //},
        //mergeSort: function(arr){
        //    var len = arr.length;
        //    if(len <2)
        //        return arr;
        //    var mid = Math.floor(len/2),
        //        left = arr.slice(0,mid),
        //        right =arr.slice(mid);
        //    //send left and right to the mergeSort to broke it down into pieces
        //    //then merge those
        //    return App.merge(App.mergeSort(left),App.mergeSort(right));
        //},

        sortWithIndeces: function(toSort) {
            for (var i = 0; i < toSort.length; i++) {
                toSort[i] = [toSort[i], i];
            }
            toSort.sort(function(left, right) {
                if (left[0] == right[0]){
                    var idx = Math.floor(Math.random() * 2);
                    if (idx > 0) {
                        return -1;
                    }else {
                        return 1;
                    }
                }else{
                    return left[0] < right[0] ? -1 : 1;
                }
            });
            toSort.sortIndices = [];
            for (var j = 0; j < toSort.length; j++) {
                toSort.sortIndices.push(toSort[j][1]);
                toSort[j] = toSort[j][0];
            }
            return toSort;
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
            //this.correct_answer = '';
            this.correct_answer = [];
            this.theta = 0; // camera angle x
            this.beta = 0; // camera angle y
            this.radius = 1500;
            this.height = [];
            this.scale = [];
            this.global_scale = 1;
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
                        mesh.position.z = d.height;
                        //mesh.castShadow = true;

                        //if (d.object.CG_emptyObj != undefined) {
                        //    mesh.position.x =  d.object.CG_emptyObj[0];
                        //    mesh.position.y =  d.object.CG_emptyObj[1];
                        //    mesh.position.z =  d.object.CG_emptyObj[2];
                        //} else {
                        //    mesh.position.x = 0;
                        //    mesh.position.y = 0;
                        //    mesh.position.z = 0;
                        //}
                        d.emptyobject.add(mesh);
                    });
                };

            this.desposeMesh = function() {
                if (typeof(d.object.children)!='undefined'){
                    $.each(d.object.children, function(i,mesh){
                        if(typeof(mesh)!='undefined'){
                            mesh.geometry.dispose();
                            mesh.material.dispose();
                            d.object.remove(mesh);
                        }
                    });
                }
                if (typeof(d.emptyobject.children)!='undefined') {
                    $.each(d.emptyobject.children, function (i, mesh) {
                        if(typeof(mesh)!='undefined'){
                            mesh.geometry.dispose();
                            mesh.material.dispose();
                            d.emptyobject.remove(mesh);
                        }
                    });
                }
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
                if(d.renderer.domElement.parentElement!=null) //modified by Hope
                    if (d.renderer.domElement.parentElement.id != 'comp_model2'){
                        App.rendering[0] = requestAnimationFrame(d.animate);
                    }
                    else{
                        App.rendering[1] = requestAnimationFrame(d.animate);
                    }
                d.render();
            };


            this.render = function() {
                //default select if in mobile side
                if( App.is_touch_device() == true) {
                    App.SELECT = true;
                }else
                {
                    App.$rotation_left.hide();
                    App.$rotation_right.hide();
                    App.$rotation_up.hide();
                    App.$rotation_down.hide();
                    //App.$zoom_bigger.hide();
                    //App.$zoom_smaller.hide();
                }
                // if in tutorial
                if(!App.tutorial_shown && App.myRole=='Host'){
                    // finish tutorial once the player selected a few
                    if (App.selection_capacity <= Obj.object_set[0].object.FaceArray[0]*0.98){
                        $('#wait.inner.cover p.lead').html('Nice:) You are done with tutorials. Now moving on to a real game...');
                        //$('#instruction p').html('');

                        App.$wait.fadeIn();

                        App.$game.hide();
                        // moving to a real game

                        // clean memory
                        $.each(Obj.object_set, function(i,o){
                            o.desposeMesh();
                        });
                        $.each(App.rendering, function(i,rendering) {
                            window.cancelAnimationFrame(rendering);
                        });
                        if(App.autoSelecting || App.playWithComputer){clearInterval(App.autoSelecting);}
                        App.setInitParameter();
                        App.tutorial_shown = true;
                        Obj.object_set = [];

                        // disable selection if the user is still selecting
                        App.$game.removeClass('active');
                        App.SELECT = false;

                        App.onJoinClick();
                    }
                }

                if(App.myRole != 'Player'){
                    if(typeof(d.object)!='undefined'){
                        //d.object.rotation.set( Math.max(-Math.PI/6,Math.min(d.object.rotation.x - d.beta, Math.PI/6)),
                        //    d.object.rotation.y + d.theta, 0, 'XYZ' );
                        d.object.rotation.set( d.object.rotation.x - d.beta, d.object.rotation.y + d.theta, 0, 'XYZ' );
                        if (d.scale>1){
                            var scale = d.global_scale* d.scale || 1;
                            d.object.children[0].scale.set(scale, scale, scale);
                        }

                    }
                }
                else{
                    if(typeof(d.emptyobject)!='undefined'){
                        //d.emptyobject.rotation.set( Math.max(-Math.PI/6,Math.min(d.emptyobject.rotation.x - d.beta, Math.PI/6)),
                        //    d.object.rotation.y + d.theta, 0, 'XYZ' );
                        d.emptyobject.rotation.set( d.emptyobject.rotation.x - d.beta, d.emptyobject.rotation.y + d.theta, 0, 'XYZ' );
                        //if (d.scale>1){
                        //    var scale = d.global_scale* d.scale || 1;
                        //    d.emptyobject.scale.set(scale, scale, scale);
                        //}

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

                //// countdown when object is shown
                //App.$timebar.css('opacity',1-(Date.now()-App.currentTime)/App.totalTime/60000);
                //if (1-(Date.now()-App.currentTime)/App.totalTime/60000<=0){
                //    App.gameOver();
                //}

                // update score based on selection, time and guesses
                if (App.object_loaded){ // to prevent long loading time
                    if (App.game_score > 0 && App.numSelectedFaces > 0){

                        var penalty;
                        if (App.tutorial_shown == true){
                            penalty = (Date.now()-App.currentTime)*0.10;
                        }
                        // MAX: penalty on selection is too high on geometries with few faces
                        penalty += (1 - App.selection_capacity/App.numSelectedFaces) * 10000;
                        App.game_score -= penalty;
                        App.currentTime = Date.now();
                        App.numSelectedFaces = App.selection_capacity;
                        if (App.game_score<0){
                            App.game_score = 0; // only store once
                            if(App.myRole='Host'){ // only one of the players needs to submit the score
                                $.post('/storeScore',{'score':App.currentRound,'gameId':App.gameId,'amt':App.amt},
                                    function(){});
                            }
                            App.showScoreBoard();
                        }
                        //App.$score.html(Math.round(App.game_score));
                        App.$score.css('width',Math.round(App.game_score/9999*10000)/100+'%');
                    }
                    else if (App.game_score < 0 && App.numSelectedFaces > 0){
                        App.game_score = 0; // only store once
                        if(App.myRole='Host'){ // only one of the players needs to submit the score
                            $.post('/storeScore',{'score':App.currentRound,'gameId':App.gameId,'amt':App.amt},
                                function(){});
                        }
                        App.showScoreBoard();
                    }
                }

                // check if model is focused, if not, focus to it.
                if (!App.$model.is(':focus') && App.myRole=='Host'){App.$model.focus();}
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
                            $.post('/read_selection', {'object_name': o.object.name,'amt':App.amt}, function (response) {
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
                                                //o.object.children[mesh_id].geometry.faces[face_id].color.r = Math.max(w / max_max_weight, 0.7);
                                                //o.object.children[mesh_id].geometry.faces[face_id].color.g = Math.max(w / max_max_weight / 5.0, 0.2);
                                                //o.object.children[mesh_id].geometry.faces[face_id].color.b = Math.max(w / max_max_weight / 5.0, 0.2);
                                                var col = Obj.getRGB(w/max_max_weight);
                                                o.object.children[mesh_id].geometry.faces[face_id].color.r = col[0]/255;
                                                o.object.children[mesh_id].geometry.faces[face_id].color.g = col[1]/255;
                                                o.object.children[mesh_id].geometry.faces[face_id].color.b = col[2]/255;
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
                            try {
                                $.get('obj/Princeton_saliency_distribution_Chen/' + saliency_distribution_id + '.val', function (response) {
                                    response = response.split('\n');
                                    if (response[response.length - 1] == '') {
                                        response = response.splice(0, response.length - 1);
                                    }
                                    $.each(response, function (i, r) {
                                        response[i] = parseFloat(r);
                                    });
                                    var max_weight = Math.max.apply(Math, response);
                                    $.each(response, function (i, r) {
                                        o.object.children[0].geometry.vertices[i].salColor = r / max_weight;
                                    });

                                    o.paint_faces();
                                    if (typeof(callback) != 'undefined') {
                                        callback();
                                    }
                                });
                            }
                            catch(err){
                                App.$comp_model2.html('no benchmark data available.');
                            }
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
                                //'three_scene': JSON.stringify(THREEScene.children[0].sorted),
                                'num_selections': "",
                                'amt':App.amt
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
            } else if (half <= val) {
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

