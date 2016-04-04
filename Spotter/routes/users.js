var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cs411a2');

var Schema = mongoose.Schema;
var track = new Schema({
    artist: String,
    twitter: String,
    rank: String
}, {
    strict: 'throw' //throw error when invalid track attempted
});
var tune = mongoose.model('tune', track);

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
        res.json(results);
    });

});

module.exports = router;
