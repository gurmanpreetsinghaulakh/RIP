const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalmongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    notifications: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })
userSchema.plugin(passportlocalmongoose);
// this automatically add username salting and hashing
module.exports = mongoose.model('User', userSchema);