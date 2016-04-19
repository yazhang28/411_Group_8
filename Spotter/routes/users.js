var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var mongoose = require('mongoose');
var fs = require('fs');
mongoose.connect('mongodb://localhost/cs411a2');

//command when mongo misbehaving:  brew services start mongodb

var Schema = mongoose.Schema;
var track = new Schema({
    artist: String,
    numPlays: String,
    songs: [],
    analytics: []
}, {
    strict: 'throw' //throw error when invalid track attempted
});
var tune = mongoose.model('tune', track);

var LastFmNode = require('lastfm').LastFmNode;

var lastfm = new LastFmNode({
    api_key: '5a63919effc53c56e941641ca870cdc6',
    secret: fs.readFileSync('./../../fm_key.txt', 'utf8') // Client secret in local text file for security
});

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


router.get('/db/topTracks/:artist', function(req, res, next) {
    var top50 = [];
    var songsRequest = lastfm.request("artist.getTopTracks", {
        artist: req.params.artist,
        handlers: {
            success: function(data) {
                console.log('Artist Top50 Success');

                var top50 = [];
                //may run into error if there are less than 50 songs
                for (var i = 0; i < 5; i++) {
                    top50.push(data.toptracks.track[i].name);
                }

                res.json(top50);

            },
            error: function(error) {
                console.log("Error: " + error.message);
            }
        }
    });

});


router.get('/db/features/:ids', function(req, res, next) {

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
            console.log(options);
            request.get(options, function(error, response, body) {
                res.json(body);
            });
        }
    });
});


router.get('/db/lookupTrack/:songName', function(req, res, next) {

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            trackName = req.params.songName;
            trackName = trackName.split(' ').join('+');
            console.log('Looking up: ' + trackName);


            // use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: 'https://api.spotify.com/v1/search?q=' + trackName + '&type=track',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function(error, response, body) {
                console.log('Audio Features Success');
                res.json(body);
            });
        }
    });
});



router.get('/db/artistInfo/:artist', function(req, res, next) {

    //need to parse artist name so search works

    var artistName = '';
    var artistPlays = 0;

    var infoRequest = lastfm.request("artist.getInfo", {
        artist: req.params.artist,
        handlers: {
            success: function(data) {
                artistName = data.artist.name;
                artistPlays = data.artist.stats.listeners;

                console.log('Artist Info Success');

                res.json(data);

            },
            error: function(error) {
                console.log("Error: " + error.message);
            }
        }
    });
});


router.get('/db/:artist', function(req, res, next) {

    tune.find({artist: req.params.artist}, function (err, results) {

        //if not in DB already, go get it
        if(Object.keys(results).length === 0) {

            artistName = req.params.artist;
            console.log(artistName + " Not Found In DB");


            /*
             *
             * info = getArtistInfo()
             *
             * tracks = getTopTracks()
             *
             * ids = getSpotifyID()
             *
             * features = getAudioFeatures()
             *
             * POST: info, tracks, ids, features
             *
             * GET: artist, return info to front end
             *
             *
             * */


            var artistInfo = {
                method: 'GET',
                url: 'http://localhost:3000/users/db/artistInfo/' + artistName
            };

            var topTracks = { method: 'GET',
                url: 'http://localhost:3000/users/db/topTracks/' + artistName
            };


            /* Dependencies */
            var Promise = require('bluebird');
            var reqP = Promise.promisifyAll(require('request-promise'));

            reqP(artistInfo)
                .then(function(infoResults) {

                    return JSON.parse(infoResults);

                })
                .then(function(info) {

                    return reqP(topTracks)
                        .then(function(results) {

                            //console.log(body);

                            return [info, results];
                        });
                })
                .then(function(topTracksResults) {

                    trackList = JSON.parse(topTracksResults[1]);

                    //get songs into proper search format
                    var song = trackList[0].split(' ').join('+');

                    var id = {
                        method: 'GET',
                        url: 'http://localhost:3000/users/db/lookupTrack/' + song
                    };

                    return reqP(id)
                        .then(function(results) {

                            var spotifyTrack = JSON.parse(results);

                            return  [topTracksResults[0], topTracksResults[1], spotifyTrack.tracks.items[0].album.id];

                        });

                })
                .then(function(data) {

                    console.log(data);

                    var audioFeatures = { method: 'GET',
                        url: 'http://localhost:3000/users/db/features/' + data[2] + ',2widuo17g5CEC66IbzveRu'
                    };

                    return reqP(audioFeatures)
                        .then(function(results) {

                            //return data.push(JSON.parse(results));
                            console.log(results);

                        })

                })
                .then(function(data) {

                    //console.log(data);


                })
                .catch(function(err) {
                    throw err;
                });



            /*
             *
             * Audio Information
             *
             */
            var audioFeatures = { method: 'GET',
                url: 'http://localhost:3000/users/db/features/4JpKVNYnVcJ8tuMKjAj50A,2NRANZE9UCmPAS5XVbXL40'
            };

            //request(audioFeatures, function (error, response, body) {
            //    if (error) throw new Error(error);
            //
            //    console.log(body);
            //});


        }
        else {
            res.json(results);
        }

    });
});

module.exports = router;
