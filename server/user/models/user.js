const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.promise = Promise;

/* eslint-disable no-invalid-this */

// Define user schema
const schema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    name: {type: String, default: '使用者'},
    photo: {type: String, default: ''},
    permissions: {type: Array, default: ['basic']},
}, {
    timestamps: {createdAt: 'createdAt'},
});

// Hash password before saving to database
schema.pre('save', function(next) {
    const saltRounds = 10;
    bcrypt.hash(this.password, saltRounds).then((hash) => {
        this.password = hash;
        next();
    }).catch((err) => {
        next(err);
    });
});

// Add password comparison function to 'User' class generated by mongoose
schema.methods.comparePassword = function(candidatePassword, callback) {
    if (callback === undefined) {
        // Return Promise
        return bcrypt.compare(candidatePassword, this.password);
    } else {
        // Old-school callback
        bcrypt.compare(candidatePassword, this.password).then((res) => {
            callback(null, res);
        }).catch((err) => {
            callback(err);
        });
    }
};

schema.methods.removeSensitiveFields = function() {
    // NOTE: Be very careful to mask out sensitive fields.
    delete this.password;
    delete this.__v;
    delete this.id;
    delete this._id;
};

// Create model and export
module.exports = mongoose.model('user', schema);
