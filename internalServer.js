var fs = require('fs');
var express = require('express');
var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;
var crypto = require('crypto');

var utils = require('./lib/utils.js');
var model = require('./lib/model.js');

var app = express();
var server = http.createServer(app); 

var logger = (req, res, next) => {
    console.log(req.connection.remoteAddress + " tried to access : " + req.url);
    next(); // Passing the request to the next handler in the stack.
}

// Configuration
app.configure(() => {
    // Session management
    app.use(express.cookieParser());
    app.use(express.session({secret: 'privateKeyForSession'}));
    app.use("/js", express.static(__dirname + '/public/js')); // javascript folder
    app.use("/css", express.static(__dirname + '/public/css')); // javascript folder

    app.set('views', __dirname + '/views'); // views folder
    app.set('view engine', 'ejs'); // view engine for this projet : ejs 

    app.use(express.bodyParser()); // for POST Requests
    app.use(logger); // Here you add your logger to the stack.
    app.use(app.router); // The Express routes handler.
});


app.get('/', (req, res) => {
    res.render('ping.ejs', {
        isConnected: req.session.isConnected,
        isAdmin: req.session.isAdmin
    });
});

// Update password
app.post('/', (req, res) => {
    ip = req.body.ip
    if (ip == "") {
        utils.redirect(req, res, '/ping-status');
    } else {
        // getting the command with req.params.command
        var child;
        // console.log(req.params.command);
        child = exec('ping ' + ip, (error, stdout, stderr) => {
            res.render('ping.ejs', {
                isConnected: req.session.isConnected,
                message: stdout,
                isAdmin: req.session.isAdmin
            });
        });
    }
});

server.listen(9000, '127.0.0.1', () => {
  console.log("Listening on port 9000");
});