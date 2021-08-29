const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required:true
    },
    userEmail: {
        type: String,
        required:true
    },
    productIds: Array,
    productDetails: Array,
    subTotalPrice: Number,
    totalPrice: Number
})

const cartModel = mongoose.model(`cartModel`, cartSchema);

module.exports = cartModel;