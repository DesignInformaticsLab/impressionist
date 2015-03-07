var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Fabian's model selection page. */
router.get('/game', function(req, res, next) {
    res.render('game', { title: 'Model Selection Test'});
});

module.exports = router;
