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
    rank: String
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

router.get('/db/:artist', function(req, res, next) {

    tune.find({artist: req.params.artist}, function (err, results) {

        //if not in DB already, go get it
        if(Object.keys(results).length === 0) {
            console.log(req.params.artist + " Not Found In DB");


            var infoRequest = lastfm.request("artist.getInfo", {
                artist: req.params.artist,
                handlers: {
                    success: function(data) {
                        console.log(data);

                        var artistInfo = { method: 'POST',
                            url: 'http://localhost:3000/users/db',
                            form: { artist: data.artist.name, twitter: "twitter.com/NA", rank: data.artist.stats.listeners} };

                        request(artistInfo, function (error, response, body) {
                            if (error) throw new Error(error);

                            console.log(body);
                        });



                    },
                    error: function(error) {
                        console.log("Error: " + error.message);
                    }
                }
            });
            //send request
            //add to db
            //find in db and return
        }
        else {
            res.json(results);
        }

    });
});

module.exports = router;
