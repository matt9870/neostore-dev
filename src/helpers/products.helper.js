const productModel = require('../models/product.model');
const deleteFile = require('./deleteFile.helper');

async function getFileDetails(tempFilesStorage) {
    let productImages = [];
    tempFilesStorage.forEach(image => {
        let eachProductImage = {
            filename: image.filename,
            destination: image.destination,
            fileType: image.mimetype
        }
        productImages.push(eachProductImage);
    });
    return productImages;
}

async function deleteFiles(tempFilesStorage) {
    tempFilesStorage.forEach(image => {
        deleteFile(`./images/productImages/${image.filename}`)
    });
}

async function getProductOfEachCategory(productCategories) {
    let productOfEachCategory = [];
    const i = productCategories.length;
    for(let j=0;j<i;j++){
        // console.log(`searching for ${productCategories[j]}`);
        await productModel.findOne({ productCategory: productCategories[j] }, (err) => {
            if (err)
                console.log(`error - ${err}`);
        }).then(data => {
            if (data) {
                productOfEachCategory.push({
                    name:data.productName,
                    image: data.productImages[0].filename,
                    rating: data.rating.average,
                    price: data.productPrice
                });
            }
        });
    }
    return productOfEachCategory;
}

async function getProductImagesDefaultColor(product) {
    const defaultColor = product.defaultColor;
    let noOfImages = product.productImages.length;
    const productImages = [];
    const regExpColor = new RegExp(defaultColor);
    for(let j=0;j<noOfImages; j++){
        const imageColorIsDefault = regExpColor.test(product.productImages[j].filename)
        if(imageColorIsDefault){
            productImages.push(product.productImages[j].filename);
        }
    }
    return productImages;
}

module.exports = {getFileDetails, deleteFiles, getProductOfEachCategory, getProductImagesDefaultColor}