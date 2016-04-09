var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var fs = require('fs');
mongoose.connect('mongodb://localhost/cs411a2');

//command when mongo misbehaving:  brew services start mongodb

var Schema = mongoose.Schema;
var track = new Schema({
    artist: String,
    twitter: String,
    numPlays: String,
    songs: []
}, {
    strict: 'throw' //throw error when invalid track attempted
});
var tune = mongoose.model('tune', track);

var LastFmNode = require('lastfm').LastFmNode;

var lastfm = new LastFmNode({
    api_key: '5a63919effc53c56e941641ca870cdc6',
    secret: fs.readFileSync('./../../fm_key.txt', 'utf8') // Client secret in local text file for security
});

/* GET users listing. */

router.get('/', function(req, res, next) {
    res.send('use /users/db');
});

router.post('/db', function(req, res, next) {
    var tune1 = new tune(req.body);
    tune1.save(function (err) {
        if (err) { console.log('error!');}
        else {
            res.json({message: 'Successful posting!'});
        }
    });
});

router.get('/db', function(req, res, next) {

    tune.find({}, function (err, results) {
        res.json(results);
    });

});


router.post('/db/topTracks/:artist', function(req, res, next) {
    var top50 = [];
    var songsRequest = lastfm.request("artist.getTopTracks", {
        artist: req.params.artist,
        handlers: {
            success: function(data) {
                console.log('Artist Top50 Success');

                //may run into error if there are less than 50 songs
                for (var i = 0; i < 50; i++) {
                    top50.push(data.toptracks.track[i].name);

                    console.log(top50[i]);
                }

                //var artistInfo = { method: 'POST',
                //    url: 'http://localhost:3000/users/db',
                //    form: { artist: artistName,
                //        twitter: "twitter.com/NA",
                //        numPlays: artistPlays,
                //        songs: top50
                //    } };
                //
                //request(artistInfo, function (error, response, body) {
                //    if (error) throw new Error(error);
                //
                //    console.log(body);
                //});

            },
            error: function(error) {
                console.log("Error: " + error.message);
            }
        }
    });

});


router.get('/db/features/:ids', function(req, res, next) {

    var client_id = '75a1c00129ce4975a7c787d2658ec88c'; // Your client id
    var client_secret = fs.readFileSync('./../../spotify_key.txt', 'utf8'); // Your client secret
    var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

    // requests authorization
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            // use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: 'https://api.spotify.com/v1/audio-features/?ids=' + req.params.ids,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function(error, response, body) {
                console.log(body);
            });
        }
    });
});


router.get('/db/:artist', function(req, res, next) {

    tune.find({artist: req.params.artist}, function (err, results) {

        //if not in DB already, go get it
        if(Object.keys(results).length === 0) {

            console.log(req.params.artist + " Not Found In DB");


            var artistName = '';
            var artistPlays = 0;
            var infoRequest = lastfm.request("artist.getInfo", {
                artist: req.params.artist,
                handlers: {
                    success: function(data) {
                        artistName = data.artist.name;
                        artistPlays = data.artist.stats.listeners;
                        console.log('Artist Info Success');

                    },
                    error: function(error) {
                        console.log("Error: " + error.message);
                    }
                }
            });

            //var top50 = [];
            //var songsRequest = lastfm.request("artist.getTopTracks", {
            //    artist: req.params.artist,
            //    handlers: {
            //        success: function(data) {
            //            console.log('Artist Top50 Success');
            //
            //            //may run into error if there are less than 50 songs
            //            for (var i = 0; i < 50; i++) {
            //                top50.push(data.toptracks.track[i].name);
            //            }
            //
            //            var artistInfo = { method: 'POST',
            //                url: 'http://localhost:3000/users/db',
            //                form: { artist: artistName,
            //                        twitter: "twitter.com/NA",
            //                        numPlays: artistPlays,
            //                        songs: top50
            //                } };
            //
            //            //request(artistInfo, function (error, response, body) {
            //            //    if (error) throw new Error(error);
            //            //
            //            //    console.log(body);
            //            //});
            //
            //
            //
            //        },
            //        error: function(error) {
            //            console.log("Error: " + error.message);
            //        }
            //    }
            //});

            //
            //var topTracks = { method: 'GET',
            //    url: 'http://localhost:3000/users/db/topTracks/' + artistName,
            //    form: { artist: artistName
            //    } };
            //
            //request(topTracks, function (error, response, body) {
            //    if (error) throw new Error(error);
            //        console.log(body);
            //});





            //problem is requests are getting ahead of other requests
            //need to split things up and wait for callbacks to return instead
            //var str = "hello there";
            //str = str.split(' ').join('+');



        }
        else {
            res.json(results);
        }

    });
});

module.exports = router;
