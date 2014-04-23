var fs = require('fs');
var express = require('express');
var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;

var utils = require('./lib/utils.js');
var model = require('./lib/model.js');

var app = express();
var server = http.createServer(app); 

var logger = function (req, res, next) {
    console.log(req.connection.remoteAddress + " tried to access : " + req.url);
    next(); // Passing the request to the next handler in the stack.
}

// Configuration
app.configure(function () {
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

app.get('/command/:command', function (req, res) {
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
app.get('/', function (req, res) {
    res.render('index.ejs', {
        isConnected: req.session.isConnected
    });
});

// About page
app.get('/about', function (req, res) {
    res.render('about.ejs', {
        isConnected: req.session.isConnected
    });
});

// Login
app.get('/login', function (req, res) {
    isConnected = req.session.isConnected;
    if (isConnected) {
        utils.redirect(req, res, '/');
    }

    res.render('login.ejs', {
        isConnected: false,
        message: req.session.message
    });

    delete req.session.message;
});

// Login
app.post('/login', function (req, res) {

    isConnected = req.session.isConnected;
    if (isConnected) {
        utils.redirect(req, res, '/');
    } else {
        username = req.body.username;
        password = req.body.password;
        if (username == undefined || username == null || username =="") {
            utils.redirect(req, res, '/login')
        } else if (password == undefined || password == null || password =="") {
            utils.redirect(req, res, '/login')
        }

        model.loginUser(username, password, function (returnUser) {
            if (returnUser && returnUser.password == password) {
                console.log('Login OK with user:' + username);
                req.session.username = returnUser.username;
                req.session.isAdmin = returnUser.is_admin;
                req.session.isConnected = true;
                utils.redirect(req, res, '/');
            } else {
                console.log('Failed login attempt with user:' + username);
                req.session.isConnected = false;
                req.session.message = 'Failed login attempt with user:' + username
                utils.redirect(req, res, '/login');
            }
        });
    }
});

// Sign up
app.get('/sign-up', function (req, res) {
    res.render('sign-up.ejs', {
        isConnected: false,
        message: req.session.message
    });
    delete req.session.message;
});

// Create an account
app.post('/sign-up', function (req, res) {
    username = req.body.username;
    password = req.body.password;
    if (username == undefined || username == null || username =="") {
        utils.redirect(req, res, '/sign-up')
    } else if (password == undefined || password == null || password =="") {
        utils.redirect(req, res, '/sign-up')
    }

    model.getUser(username, function (user) {
        if (user == null) {
            model.createUser(username, password, false);
            utils.redirect(req, res, '/login');
        } else {
            req.session.message = "The user " + username + " already exists.."
            utils.redirect(req, res, '/sign-up');
        }
    })
});

// bootstrap help 
app.get('/bootstrap', function (req, res) {
    res.render('bootstrap.ejs', {
        isConnected: false
    });
});

// List users
app.get('/users', function (req, res) {
    if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        model.getUsers(function (usersModel) {
            res.render('users.ejs', {
                isConnected: req.session.isConnected,
                users: usersModel
            });    
        });
    }
});

// Get messages from one specific user
app.get('/messages', function (req, res) {
   if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        model.getMessages(req.session.username, function (messages) {
            res.render('messages.ejs', {
                isConnected: req.session.isConnected,
                messages: messages
            });
        });
    }
});

// Get messages from one specific user
app.get('/send-message', function (req, res) {
   if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        model.getUsers(function (users) {
            res.render('send-message.ejs', {
                isConnected: req.session.isConnected,
                users: users,
                username: req.session.username,
                message: req.session.message
            });
        });
    }
});

// Send message
app.post('/send-message', function (req, res) {
   if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        from = req.session.username;
        to = req.body.to; 
        message = req.body.message;

        if (to == null || to == undefined || to =="") {
            req.session.message = "An error happened while sending the message..";
            utils.redirect(req, res, '/send-message');
        } else if (message == null || message == undefined || message =="") {
            req.session.message = "An error happened while sending the message..";
            utils.redirect(req, res, '/send-message');
        } else {
            model.createMessage(from, to, message);
            utils.redirect(req, res, '/');    
        }
    }
});

app.get('/change-password', function (req, res) {
   if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        res.render('change-password.ejs', {
            isConnected: req.session.isConnected,
            username: req.session.username,
            message: req.session.message
        });        
    }
});

// Update password
app.post('/change-password', function (req, res) {
   if (!req.session.isConnected) {
        utils.redirect(req, res, '/login');
    } else {
        username = req.session.username;
        password = req.body.password;

        if (password == null || password == undefined || password =="") {
            req.session.message = "An error happened while updating your password..";
            utils.redirect(req, res, '/change-password');
        } else {
            model.changePassword(username, password);
            utils.redirect(req, res, '/');    
        }
    }
});

// logout
app.get('/logout', function (req, res) {
    delete req.session.isConnected;
    delete req.session.username;
    delete req.session.isAdmin;
    utils.redirect(req, res, '/');
});

server.listen(8080);