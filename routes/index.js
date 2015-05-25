var express = require('express');
var router = express.Router();
var pg = require('pg');

var connection = "postgres://postgres:GWC464doi@localhost:5432/postgres"; //for local postgres server
var connection_online = process.env.DATABASE_URL; //for online version
function handle_error(res, err) {
    console.error(err);
    res.status(500).send("Error " + err);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Fabian's model selection page. */
router.get('/game', function(req, res, next) {
    res.render('game', { title: 'Model Selection Test'});
});


/* try sketchy output */
router.get('/game_sketch', function(req, res, next) {
    res.render('sketch', { title: 'Model Selection Test'});
});


/* store selection */
router.post('/store_selection', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var obj_id = req.body.obj_id;
        var mesh_id = JSON.parse(req.body.mesh_id);
        var weight = JSON.parse(req.body.weight);
        var insert_query = client.query('INSERT INTO impressionist_selection_table (obj_id, mesh_id, weight) VALUES ($1, $2, $3)',
            [obj_id, mesh_id, weight]);
        insert_query.on('err', handle_error.bind(this, err));
        insert_query.on('end', function(result){res.status(202).send("Accepted data");});
        done();
    });
});

/* read all selections */
router.post('/read_selection', function(req,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.status(500).send("Could not connect to DB: " + err);
        var query = 'SELECT * FROM impressionist_selection_table WHERE obj_id=$1';
        client.query(query, [req.body.obj_id], function(err, result) {
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


router.post('/initial_obj', function(reg,res){
    pg.connect(connection, function(err, client, done) {
        if(err) res.send("Could not connect to DB: " + err);
        var object_name = req.body.object_name;
        var face_per_mesh = JSON.parse(req.body.face_per_mesh);
        var num_selections = JSON.parse(req.body.num_selections);
        var insert_query = client.query('INSERT INTO impressionist_object_table (object_name, face_per_mesh, num_selections) VALUES ($1, $2, $3)',
            [object_name, face_per_mesh, num_selections]);
        insert_query.on('err', handle_error.bind(this, err));
        insert_query.on('end', function(result){res.status(202).send("Accepted data");});
        done();
    });
});

module.exports = router;
