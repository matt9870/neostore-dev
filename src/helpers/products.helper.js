const productModel = require('../models/product.model');
const deleteFile = require('./deleteFile.helper');
const productCategoryModel = require('../models/productCategories.model');

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
    for (let j = 0; j < i; j++) {
        // console.log(`searching for ${productCategories[j]}`);
        await productModel.findOne({ productCategory: productCategories[j] }, (err) => {
            if (err)
                console.log(`error - ${err}`);
        }).then(data => {
            if (data) {
                productOfEachCategory.push({
                    name: data.productName,
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
    for (let j = 0; j < noOfImages; j++) {
        const imageColorIsDefault = regExpColor.test(product.productImages[j].filename)
        if (imageColorIsDefault) {
            productImages.push(product.productImages[j].filename);
        }
    }
    return productImages;
}

async function addQuantity(cart, product, productColorSelected) {
    let j = 0, noOfProducts = cart.productIds.length, arrayNumber = 0, productExists = false;

    while (j < noOfProducts) {
        if (cart.productDetails[j].productId.equals(product._id) && cart.productDetails[j].productColor === productColorSelected) {
            productExists = true;
            arrayNumber = j;
        }
        j++;
    }
    if (productExists) {
        cart.productDetails[arrayNumber].orderQuantity = cart.productDetails[arrayNumber].orderQuantity + 1;
        cart.productDetails[arrayNumber].total = cart.productDetails[arrayNumber].total + product.productPrice;
        if (cart.subTotalPrice === undefined)
            cart.subTotalPrice = product.productPrice;
        else
            cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
        cart.totalPrice = 1.05 * cart.subTotalPrice;
        console.log(`added the quantity of the existing product`);
        return cart;
    }
    else
        return addNewProduct(cart, product, productColorSelected);
    while (j < noOfProducts) {
        if (cart.productDetails[j].productId.equals(product._id)) {
            cart.productDetails[j].orderQuantity = cart.productDetails[j].orderQuantity + 1;
            cart.productDetails[j].total = cart.productDetails[j].total + product.productPrice;
            if (cart.subTotalPrice === undefined)
                cart.subTotalPrice = product.productPrice;
            else
                cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
            cart.totalPrice = 1.05 * cart.subTotalPrice;
            console.log(`added the quantity of the existing product`);
            return cart;
        }
        j++;
    }

}

async function addNewProduct(cart, product, productColorSelected) {
    console.log(`adding new product`);
    const productImage = await getProductImagesOfColor(product, productColorSelected);
    cart.productIds.push(product._id);
    cart.productDetails.push({
        productId: product._id,
        productName: product.productName,
        productSeller: product.productSeller,
        productColor: productColorSelected,
        productImage: productImage,
        productStock: product.productStockCount,
        orderQuantity: 1,
        productPrice: product.productPrice,
        total: product.productPrice,
    })
    if (cart.subTotalPrice === undefined)
        cart.subTotalPrice = product.productPrice;
    else
        cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
    cart.totalPrice = 1.05 * cart.subTotalPrice;
    return cart;
}

async function getProductImagesOfColor(product, color) {
    let noOfImages = product.productImages.length;
    const regExpColor = new RegExp(color);
    for (let j = 0; j < noOfImages; j++) {
        let imageColorIsDefault = regExpColor.test(product.productImages[j].filename)
        if (imageColorIsDefault) {
            return product.productImages[j].filename;
        }
    }
}

async function addProductCount() {
    try {
        let serverDataArray = await productCategoryModel.find({});
        let serverData = await productCategoryModel.findById(serverDataArray[0]._id);
        serverData.productCount += 1;
        serverData.save(serverData).then(data => {
            return (`product count has been increased to ${data.productCount}`);
        }).catch(err => {
            return (`product count was not increased due to the err - ${err}`);
        })
    } catch (error) {
        return error
    }
}

async function addRatingToServerData(productId, rating) {
    try {
        let productDefaultData = await productCategoryModel.find({});
        let serverData = await productCategoryModel.findById(productDefaultData[0]._id);

        if (!serverData)
            throw `serverdata not found`

        if (serverData.topRatedProducts.length === 0) {
            console.log(`adding product to top rated products for first time`);
            serverData.topRatedProducts.push({
                productId,
                averageRating: rating.average,
                count: rating.count
            })
        } else {
            let arrayLength = serverData.topRatedProducts.length, j = 0, productExists = false;
            while (j < arrayLength) {
                if (serverData.topRatedProducts[j].productId.equals(productId)) {
                    serverData.topRatedProducts[j].count = rating.count;
                    serverData.topRatedProducts[j].averageRating = rating.average;
                    productExists = true;
                }
                j++;
            }
            if (!productExists) {
                console.log(`adding new product to top rated products`);
                serverData.topRatedProducts.push({
                    productId,
                    averageRating: rating.average,
                    count: rating.count
                })
            }
        }
        serverData.save(serverData).then(async data => {
            console.log(`data saved to serverData- ${data.topRatedProducts}`);
            return true;
        }).catch(err => {
            console.log(`error while saving serverData`, err);
        })
    } catch (error) {
        console.log(error);
        return error
    }

}

async function gettopRatedProducts() {
    let productDefaultData = await productCategoryModel.find({});
    let serverData = await productCategoryModel.findById(productDefaultData[0]._id);
    let topRatedProducts = [];
    let arrayLength = serverData.topRatedProducts.length, j = 0;
    while (j < arrayLength) {
        const product = await productModel.findById(serverData.topRatedProducts[j].productId)
        topRatedProducts.push({
            name: product.productName,
            image: product.productImages[0].filename,
            rating: product.rating.average,
            price: product.productPrice
        });
        j++;
    }
    return topRatedProducts;
}

module.exports = { getFileDetails, deleteFiles, getProductOfEachCategory, getProductImagesDefaultColor, addQuantity, addNewProduct, addRatingToServerData, addProductCount, gettopRatedProducts }