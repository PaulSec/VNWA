var mongoose = require('mongoose');
var fs = require('fs');
var crypto = require('crypto');

// connect
mongoose.connect('mongodb://localhost/vnwa', function(err) {
    if (err) { 
        throw err; 
    }
});

///////////////////////////
/// User
///////////////////////////

// Schema
var userSchema = new mongoose.Schema({
    username : { type : String},
    password : String,
    is_admin: Boolean
});

// model
var userModel = mongoose.model('users', userSchema);

// create user
exports.createUser = function (userName, password, isAdmin) {
    var newUser = new userModel({username: userName})
    newUser.password = crypto.createHash('sha256').update(password).digest('hex');
    newUser.is_admin = isAdmin

    newUser.save(function (err) {
        if (err) { 
            throw err; 
        }
        console.log('User: ' + userName + ' created. ');
    });
}

// get specific user
exports.getUser = function(name, callback) {
    userModel.find({username: name}, function (err, user) {
        if (err) {
            throw err;
        }

        // delete password from object user
        user = user[0];
        if (user != null) {
            delete user.password;
        }
        callback(user);
    });    
}

// Get all users
exports.getUsers = function(callback) {
    userModel.find(null, function (err, users) {
        if (err) {
            throw err;
        }
        // delete password from object user
        users.forEach(function (user){
            delete user.password
        });

        callback(users);
    });
}

// Change password
exports.changePassword = function(userName, newPassword) {
    newPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
    userModel.update({username : userName}, {password : newPassword}, {multi : true}, function (err) {
        if (err) {
            throw err; 
        }
        console.log("User: " + userName + " got his password updated.");
    });
}


///////////////////////////
/// Message
///////////////////////////

// Schema
var messageSchema = new mongoose.Schema({
    from : String,
    to : String,
    message: String,
    date : {type : Date, default : Date.now}
});

// model
var messageModel = mongoose.model('messages', messageSchema);

// create message
exports.createMessage = function (fromUser, toUser, contentMessage) {
    var newMessage = new messageModel({from: fromUser, to: toUser, message: contentMessage})

    newMessage.save(function (err) {
        if (err) { 
            throw err; 
        }
        console.log('Message from ' + fromUser + ' to ' + toUser + ' created. ');
    });
}

// get messages from specific user
exports.getMessages = function(toUser, callback) {
    console.log(toUser);
    messageModel.find({to: toUser}, function (err, messages) {
        if (err) {
            throw err;
        }
        console.log(messages);
        callback(messages);
    });    
}

// get all messages
exports.getAllMessages = function(callback) {
    messageModel.find(null, function (err, messages) {
        if (err) {
            throw err;
        }
        callback(messages);
    });
}