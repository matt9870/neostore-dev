const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required:true,
        unique:true
    },
    productSeller: {
        type: String,
        required:true,
    },
    productDesc: {
        type: String,
        required:true
    },
    productFeatures: {
        type: String,
        required:true
    },
    productCategory: {
        type: String,
        required:true
    },
    productColors: {
        type: Array,
        required: true
    },
    productImages:{
        type: Array,
        required: true
    },
    defaultColor: {
        type: String
    },
    rating:{
        count: Number,
        users: Array,
        average: Number
    },
    productPrice: {
        type: Number,
        required:true
    },
    productStockCount:{
        type: Number,
        required:true
    },
    productOrderCount: Number,
    productOrderSuccess: Number
})

const productModel = mongoose.model(`productModel`, productSchema); 

module.exports = productModel;