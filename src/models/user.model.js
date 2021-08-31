const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true,
        unique: true
        // validate: {
        //     validator: function(v) {
        //         return /d{10}/.test(v);
        //     },
        //     message: '{VALUE} is not a valid 10 digit number!'
        // }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    profile_pic: {
        filename: { type: String, required: true },
        destination: String,
        fileType: String
    },
    gender: {
        type: String,
        enum: [`male`, `female`],
        required: true
    },
    role: {
        type: String,
        default: `customer`,
        required: true
    },
    orders: {
        type: Array
    },
    addresses: [{
        address: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    }],
    defaultAddress : ObjectId,
    resetCode: Number,
    cartId: {
        type: ObjectId
    },
})

function arrayLimit(val) {
    return val.length <= 10;
}

const userModel = mongoose.model(`userModel`, userSchema);

module.exports = userModel;