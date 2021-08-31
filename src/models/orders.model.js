const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required:true
    },
    userName : {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required:true
    },
    productDetails: [{
        productId:ObjectId,
        productName:String,
        productSeller:String,
        productColor: String,
        productStock:Number,
        orderQuantity:Number,
        productImage: String,
        productPrice:Number,
        total:Number
    }],
    address:{
        address: {
            type: String
        },
        pincode: {
            type: Number
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        }
    },
    subTotalPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: 'false'
    }
},
    {timestamps: true}
);

const orderModel = mongoose.model(`orderModel`, orderSchema);

module.exports = orderModel;