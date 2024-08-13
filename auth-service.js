const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; 

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://admin:admin@krishxps.yox3f71.mongodb.net/?retryWrites=true&w=majority&appName=krishxps");

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10, (err, hash) => {
                if (err) {
                    reject("Error encrypting password");
                } else {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        } else {
                            resolve();
                        }
                    });
                }
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName }).exec()
            .then((users) => {
                if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, users[0].password).then((result) => {
                        if (!result) {
                            reject("Incorrect Password for user: " + userData.userName);
                        } else {
                            users[0].loginHistory.push({
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            });

                            User.updateOne(
                                { userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } }
                            ).exec()
                                .then(() => {
                                    resolve(users[0]);
                                })
                                .catch((err) => {
                                    reject("There was an error verifying the user: " + err);
                                });
                        }
                    });
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};

