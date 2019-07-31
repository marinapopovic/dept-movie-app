var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Movie Search', movie: null, poster: null, desc: null, trailers: null, error: null });
});

module.exports = router;
