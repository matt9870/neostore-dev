const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    productCategories: []
})

const productCategoryData = mongoose.model('productCategoryData', productCategorySchema);

module.exports = productCategoryData;