const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required:true
    },
    userEmail: {
        type: String,
        required:true
    },
    productDetails: {
        productName: String,
        productSeller: String,
        productStock: Number,
        orderQuantity: Number,
        productPrice: Number
    },
    subTotalPrice: Number,
    totalPrice: Number
},
    {timestamps: true}
);

const orderModel = mongoose.model(`orderModel`, orderSchema);

module.exports = orderModel;