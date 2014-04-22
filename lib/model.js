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

// create the file
exports.createFile = function(nameFile, typeDoc) {
    var newFile = new fileModel({ id : nameFile });

    if (typeDoc == "markdown") {
        fs.readFile(__dirname + '/../views/template/markdown_template.ejs', function(err, data) {
            if (err) {
                throw err;
            }
            newFile.content = data;
            newFile.typeDoc = typeDoc;

            newFile.save(function (err) {
                if (err) { 
                    throw err; 
                }
                console.log('Markdown with id : ' + nameFile + " successfully created.");
            });
        });
    } else if (typeDoc == "doc") {
        fs.readFile(__dirname + '/../views/template/doc_template.ejs', function(err, data) {
            if (err) {
                throw err;
            }
            newFile.content = data;
            newFile.typeDoc = typeDoc;

            newFile.save(function (err) {
                if (err) { 
                    throw err; 
                }
                console.log('Doc with id : ' + nameFile + " successfully created.");
            });
        });
    }
}

// get file
exports.getFile = function(nameFile, callback) {
    fileModel.find({id: nameFile}, function (err, file) {
        if (err) {
            throw err;
        }
        if (file.length == 0) {
            callback(null);
        } else {
            callback(file[0]);
        }
    });
}

// update file
exports.saveFile = function(file) {
    fileModel.update({ id : file.id}, { content : file.content }, { multi : true }, function (err) {
        if (err) { 
            throw err; 
        }
        console.log('File with id : ' + file.id + ' modified.');
    });
}