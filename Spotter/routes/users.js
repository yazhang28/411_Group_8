var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cs411a2');

var Schema = mongoose.Schema;
var track = new Schema({
    title: String,
    artist: String
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
            res.json({message: 'Track successfully posted'});
        }
    });
});

router.get('/db', function(req, res, next) {

    tune.find({}, function (err, results) {
        res.json(results);
    });

});

module.exports = router;
