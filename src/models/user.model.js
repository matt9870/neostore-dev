const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required
    }
})

const userModel = mongoose.model(`userModel`, userSchema);

module.exports = userModel;