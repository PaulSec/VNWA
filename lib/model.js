var mongoose = require('mongoose');
var fs = require('fs');

// connect
mongoose.connect('mongodb://localhost/vnwa', function(err) {
    if (err) { 
        throw err; 
    }
});

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
    newUser.password = password
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

// get specific user
exports.loginUser = function(name, password, callback) {
    userModel.find({username: name}, function (err, user) {
        if (err) {
            throw err;
        }

        user = user[0];
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
    userModel.update({username : userName}, {password : newPassword}, {multi : true}, function (err) {
        if (err) {
            throw err; 
        }
        console.log("User: " + userName + " got his password updated.");
    });
}
