var fs = require('fs');
var express = require('express');
var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;
var utils = require('./lib/utils.js');

var app = express();
var server = http.createServer(app); 

var logger = function(req, res, next) {
    console.log(req.connection.remoteAddress + " tried to access : " + req.url);
    next(); // Passing the request to the next handler in the stack.
}

// Configuration
app.configure(function() {
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

app.get('/command/:command', function(req, res) {
    // getting the command with req.params.command
    var child;
    // console.log(req.params.command);
    child = exec(req.params.command, function (error, stdout, stderr) {
        res.send(stdout);
        sys.print('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});

// homepage
app.get('/', function(req, res) {
    res.render('index.ejs', {
        isConnected: req.session.isConnected
    });
});

// About page
app.get('/about', function(req, res) {
    res.render('about.ejs', {
        isConnected: req.session.isConnected
    });
});

// Login
app.get('/login', function(req, res) {
    isConnected = req.session.isConnected;
    if (isConnected) {
        utils.redirect(req, res, '/');
    }

    res.render('login.ejs', {
        isConnected: false
    });
});

// Sign up
app.get('/sign-up', function(req, res) {
    res.render('sign-up.ejs', {
        isConnected: false
    });
});

// Create an account
app.post('/sign-up', function(req, res) {
    username = req.body.username;
    password = req.body.password;
    if (username == undefined || username == null || username =="") {
        utils.redirect(req, res, '/sign-up')
    } else if (password == undefined || password == null || password =="") {
        utils.redirect(req, res, '/sign-up')
    }

    console.log('We created user: ' + username);
    utils.redirect('/login');
});

server.listen(8080);