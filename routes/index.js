var express = require('express');
var router = express.Router();
var pg = require('pg');

var connection = process.env.DATABASE_URL ||"postgres://postgres:54093960@127.0.0.1:5432/postgres"
    || "postgres://postgres:GWC464doi@127.0.0.1:5432/postgres";

//for local postgres server, and Heroku server
var objectstring_set = [
    "obj/Princeton/0.js","obj/Princeton/2.js","obj/Princeton/5.js","obj/Princeton/10.js","obj/Princeton/12.js",
    "obj/Princeton/15.js","obj/Princeton/20.js","obj/Princeton/25.js","obj/Princeton/40.js","obj/Princeton/45.js",
    "obj/Princeton/55.js","obj/Princeton/60.js","obj/Princeton/65.js","obj/Princeton/70.js","obj/Princeton/80.js",
    "obj/Princeton/85.js","obj/Princeton/90.js","obj/Princeton/95.js","obj/Princeton/105.js","obj/Princeton/110.js",

    "obj/Princeton/115.js","obj/Princeton/200.js","obj/Princeton/201.js","obj/Princeton/202.js","obj/Princeton/203.js",
    "obj/Princeton/204.js","obj/Princeton/205.js","obj/Princeton/206.js","obj/Princeton/207.js","obj/Princeton/208.js",
    "obj/Princeton/209.js","obj/Princeton/210.js","obj/Princeton/269.js","obj/Princeton/270.js","obj/Princeton/281.js",
    "obj/Princeton/285.js","obj/Princeton/299.js","obj/Princeton/300.js", "obj/Princeton/381.js","obj/Princeton/382.js",

    "obj/Princeton/383.js","obj/Princeton/384.js","obj/Princeton/385.js","obj/Princeton/386.js","obj/Princeton/387.js",
    "obj/Princeton/388.js","obj/Princeton/389.js","obj/Princeton/390.js","obj/Princeton/391.js","obj/Princeton/392.js",
    "obj/Princeton/393.js","obj/Princeton/394.js","obj/Princeton/395.js","obj/Princeton/396.js","obj/Princeton/397.js",
    "obj/Princeton/398.js","obj/Princeton/400.js"
    //,"obj/Princeton/430.js","obj/Princeton/485.js","obj/Princeton/490.js",
    //
    //"obj/Princeton/495.js","obj/Princeton/520.js","obj/Princeton/550.js","obj/Princeton/560.js","obj/Princeton/575.js",
    //"obj/Princeton/585.js","obj/Princeton/590.js","obj/Princeton/595.js","obj/Princeton/600.js","obj/Princeton/605.js",
    //"obj/Princeton/615.js","obj/Princeton/630.js","obj/Princeton/645.js","obj/Princeton/650.js","obj/Princeton/670.js",
    //"obj/Princeton/705.js","obj/Princeton/720.js","obj/Princeton/725.js","obj/Princeton/735.js","obj/Princeton/775.js",
    //
    //"obj/Princeton/785.js","obj/Princeton/795.js","obj/Princeton/825.js","obj/Princeton/850.js","obj/Princeton/870.js",
    //"obj/Princeton/945.js","obj/Princeton/980.js","obj/Princeton/985.js","obj/Princeton/995.js","obj/Princeton/1085.js",
    //"obj/Princeton/1095.js","obj/Princeton/1105.js","obj/Princeton/1125.js"
];
//var objectstring_set = ["obj/Princeton/381.js","obj/Princeton/382.js","obj/Princeton/383.js","obj/Princeton/384.js",
//    "obj/Princeton/385.js","obj/Princeton/386.js","obj/Princeton/387.js","obj/Princeton/388.js","obj/Princeton/389.js",
//    "obj/Princeton/390.js","obj/Princeton/391.js","obj/Princeton/392.js","obj/Princeton/393.js","obj/Princeton/394.js",
//    "obj/Princeton/395.js","obj/Princeton/396.js","obj/Princeton/397.js","obj/Princeton/398.js",
//    "obj/Princeton/400.js"]; //["obj/BMW 328/BMW328MP.js", "obj/Dino/Dino.js", "obj/fedora/fedora.js",
////    "obj/Helmet/helmet.js", "obj/iPhone/iPhone.js", "obj/Lampost/LampPost.js", "obj/TeaPot/TeaPot.js",
////    "obj/Princeton/381.js", "obj/Princeton/382.js", "obj/Princeton/383.js"];

function handle_error(res, err) {
    console.error(err);
    res.status(500).send("Error " + err);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Impressionist | Home' });
});

/* GET game page. */
router.get('/game', function(req, res, next) {
    res.render('game', { title: 'Impressionist | Game'});
});


/* try sketchy output */
router.get('/game_sketch', function(req, res, next) {
    res.render('sketch', { title: 'Model Selection Test'});
});

router.post('/newGame', function(req, res, next) {
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        //var player_id = req.body.player_id;
        //var host_id = req.body.host_id;
        client.query('INSERT INTO impressionist_game_table (start_time, score) ' +
            'VALUES (clock_timestamp(), 0) RETURNING id', function(err, result){
            if (err) {
                handle_error.bind(this, err);
            }
            else {
                res.send( result.rows );
                done();
            }
        });
    });
});

/* store current selection */
router.post('/store_selection', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var game_id = req.body.game_id;
        var all_selected_id = JSON.parse(req.body.all_selected_id);
        var duration = req.body.duration;
        var score = req.body.score;
        var guess = req.body.answer;
        var object_name = req.body.object_name;
        var correct = req.body.correct;
        var round = req.body.round;
        var penalty = [];
        var insert_query = client.query('INSERT INTO impressionist_result_table (game_id, round, all_selected_id, duration,' +
            ' score, guess, object_name, correct, penalty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [game_id, round, all_selected_id, duration, score, guess, object_name, correct, penalty]);
        insert_query.on('err', handle_error.bind(this, err));
        insert_query.on('end', function(result){res.status(202).send("Accepted data");});
        done();
    });
});

/* read all selections */
router.post('/read_selection', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.status(500).send("Could not connect to DB: " + err);
        var query = 'SELECT all_selected_id FROM impressionist_result_table WHERE object_name=$1 AND correct=TRUE';
        client.query(query, [req.body.object_name], function(err, result) {
            if(err) {
                console.error(err); res.send("Error " + err);
            }
            else{
                res.send( result.rows );
            }
            done();
        });
    });
});




router.post('/initial_obj', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var object_name = req.body.object_name;
        var face_per_mesh = JSON.parse(req.body.face_per_mesh);
        var num_selections = [];
        var insert_query = client.query('INSERT INTO impressionist_object_table (object_name, face_per_mesh, num_selections) VALUES ($1, $2, $3)',
            [object_name, face_per_mesh, num_selections]);
        //var insert_query = client.query('INSERT INTO impressionist_object_table (object_name, three_scene, face_per_mesh, num_selections) VALUES ($1, $2, $3, $4)',
        //    [object_name, three_scene, face_per_mesh, num_selections]);
        insert_query.on('err', handle_error.bind(this, err));
        insert_query.on('end', function(result){res.status(202).send("Accepted data");});
        done();
    });
});

// get object list from database
router.post('/getObjectList', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.status(500).send("Could not connect to DB: " + err);
        var query = 'SELECT id, object_name FROM impressionist_object_table';
        client.query(query, function(err, result) {
            if(err) {
                console.error(err); res.send("Error " + err);
            }
            else{
                res.send( result.rows );
            }
            done();
        });
    });
});

// get object list from objectstring_set, should be the same as /getObjectList if database list updated
router.get('/getRawObjectList', function(req,res){
    res.send({'objectstring_set':objectstring_set});
});

// store player score
router.post('/storeScore', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var gameId = req.body.gameId;
        var score = req.body.score;
        var edit_query = 'UPDATE impressionist_game_table SET score = $1, end_time = clock_timestamp() WHERE id = $2';
        client.query(edit_query, [score, gameId], function(err) {
            if(err) {
                console.error(err); res.send("Error " + err);
            }
            else{
                res.status(202).send("Accepted data");
            }
            done();
        });
    });
});

router.post('/getTotalNumber', function(req, res) {
    pg.connect(connection, function(err, client, done) {
        if(err) res.status(500).send("Could not connect to DB: " + err);
        var query = 'SELECT COUNT(*) FROM impressionist_game_table WHERE score > 0';
        client.query(query, function(err, result) {
            if(err) {
                console.error(err); res.send("Error " + err);
            }
            else{
                res.send( result.rows );
            }
            done();
        });
    });
});

router.post('/getRanking', function(req, res) {
    pg.connect(connection, function(err, client, done) {
        if(err) res.status(500).send("Could not connect to DB: " + err);
        var current_score = req.body.score;
        var query = 'SELECT COUNT(*) FROM impressionist_game_table WHERE score < ' + current_score + ' AND score > 0';
        client.query(query, function(err, result) {
            if(err) {
                console.error(err); res.send("Error " + err);
            }
            else{
                res.send( result.rows );
            }
            done();
        });
    });
});

module.exports = router;
