var express = require('express');
var request = require('request');
var router = express.Router();
var lru = require("lru-cache");
var async = require("async");
var cache = new lru({
    max: 500,
    maxAge: 1000 * 60 * 60 // 60 minutes
});

var apiKeyOMDb = process.env.API_KEY_OMDB;
var apiKeyYT = process.env.API_KEY_YT;
console.log(apiKeyOMDb)
console.log(apiKeyYT)

var imdbSearch = function (req, res, next) {
    var term = req.query.q;

    var val = cache.get(term);
    if (val !== undefined) {
        return res.json(val);
    }

    let url = 'http://www.omdbapi.com/?s=' + encodeURIComponent(term) + '&type=movie&apikey=' + apiKeyOMDb;
    request(url, function (err, resp, body) {
        if (err) {
            return next(err);
        }
        if (resp.statusCode !== 200) {
            return next(new Error(body));
        }

        var movies = JSON.parse(body);
        var arrOMDb = new Array();
        var searchRes = movies["Search"];
        if (!searchRes) {
            return res.status(404).send('Not found.');
        }
        
        let limit = searchRes.length < 5 ? searchRes.length : 5;
        for (var i = 0; i < limit; i++) {
            var item = {
                title: searchRes[i]["Title"],
                poster: searchRes[i]["Poster"],
                year: searchRes[i]["Year"]
            };
            arrOMDb.push(item);
        }
        req.movies = arrOMDb;
        next();
    });
}

var imdbPlot = function (req, res, next) {

    if (!req.movies) {
        return res.status(404).send('Not found.');
    }
    async.map(req.movies, function(movie, callback) {
        let url = 'http://www.omdbapi.com/?t=' + encodeURIComponent(movie.title) + '&type=movie&apikey=' + apiKeyOMDb;
        request(url, function (err, resp, body) {
            if (err) {
                return callback(err);
            }
            if (resp.statusCode !== 200) {
                return callback(new Error('Unexpected error: ' + resp.statusCode));
            }
            
            var m = JSON.parse(body);
            movie.plot = m.Plot;
            callback();
        });
        
    }, function(err, results) {
        next(err);
    });
}

var ytSearch = function (req, res, next) {
    var movieResults = new Array();
    async.map(req.movies, function(movie, callback) {
        let term = movie.title + ' ' + movie.year + ' official trailer';
        let urlYT = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&topicID=02vxn&q=' + encodeURIComponent(term) + '&key=' + apiKeyYT;
        request(urlYT, function (err, resp, body) {
            if (err) {
                return next(err);
            }
            if (resp.statusCode !== 200) {
                //return res.status(resp.statusCode).send(body);
                return next(new Error(body));
            } 
            var ytrailer = JSON.parse(body);
            var videoId = ytrailer.items[0]["id"]["videoId"];
            var ytVideo = 'https://www.youtube.com/watch?v=' + videoId;
            var ytTitle = ytrailer.items[0]["snippet"]["title"];
            var ytImg = ytrailer.items[0]["snippet"]["thumbnails"]["default"]["url"];
            
            var item = {
                link: ytVideo,
                title: ytTitle,
                img: ytImg
            };
            var data = {movie: movie, trailer: item};
            movieResults.push(data);
            callback();
        });
        
    }, function(err, results) {
        if (err) {
            return next(err);
        } 
        cache.set(req.query.q, movieResults);
        return res.json(movieResults);
    });
}

router.get('/search', imdbSearch, imdbPlot, ytSearch);

module.exports = router;