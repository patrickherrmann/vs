var User = require('../../models/User');
var express = require('express');
var router = express.Router();
var auth = require('../../auth');

router.post('/', function(req, res) {

    var user = new User({
        username: req.body.username,
        password: req.body.password
    });

    user.save(function(err) {
        if (err)
            res.send(err);

        res.json({
            message: 'Created user' + user.username
        });
    });
});

module.exports = router;
