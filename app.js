var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var collectors = require('./twitter/collectors');
var passport = require('passport');
var authController = require('./auth');

var app = express();

// Set up auth
app.use(passport.initialize());

// Set up mongoose
var mongo = process.env.MONGODB;
if (mongo == undefined) {
    throw "Database undefined. Add MONGODB environment variable.";
}

var mongoUri = "mongodb://localhost/" + mongo;

mongoose.connect(mongoUri, function(err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + mongoUri + '. ' + err);
    } else {
        console.log('Succeeded connecting to: ' + mongoUri);
    }
});

// serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// add favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bind routes
app.use('/api/collections/', require('./routes/api/collections'));
app.use('/api/users/', require('./routes/api/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

collectors.start();

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
