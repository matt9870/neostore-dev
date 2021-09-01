const productModel = require('../models/product.model');
const productCategoryModel = require('../models/productCategories.model');
const productColorModel = require('../models/productColors.model');
const productsHelper = require('../helpers/products.helper');
const userModel = require('../models/user.model');
const cartModel = require('../models/cart.model');
const app = require('../config/default.json')

//main apis

//admin
exports.addProduct = async (req, res) => {
    try {
        if (!req.files.images) {
            // await productsHelper.deleteFiles(req.files.images);
            return res.status(402).send({
                message: 'Files not saved to DB'
            })
        }
        const productImagesArray = await productsHelper.getFileDetails(req.files.images);

        const product = new productModel({
            productName: req.body.productName,
            productSeller: req.body.seller,
            productDesc: req.body.description,
            productFeatures: req.body.features,
            productCategory: req.body.category,
            productColors: req.body.color,
            productImages: productImagesArray,
            defaultColor: req.body.color,
            rating: {
                count: 0,
                users: [],
                average: 0
            },
            productPrice: req.body.price,
            productStockCount: req.body.stock
        })

        product.save(product).then(async productData => {
            let productCount = await productsHelper.addProductCount();
            res.status(200).send({
                message: `Product saved to DB and ${productCount}`,
                productData
            })
        }).catch(async err => {
            await productsHelper.deleteFiles(req.files.images);
            res.status(402).send({
                message: 'Product not saved to DB',
                err,
                errorMessage: err.message
            })
        })
    } catch (error) {
        res.status(500).send({
            messgae: `Server error. Something broke`,
            errorMessage: error.message,
            error
        })
    }
}

exports.addProductImages = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        const productImagesArray = await productsHelper.getFileDetails(req.files.images);
        productImagesArray.forEach(imageData => {
            product.productImages.push(imageData);
        })
        product.productStockCount += parseInt(req.body.stock) || 0;
        product.productColors.push(req.body.color);

        product.save(product).then(data => {
            res.status(200).send({
                message: `Successfully added new files to DB`,
                data
            })
            return;
        }).catch(async err => {
            await productsHelper.deleteFiles(req.files.images);
            res.status(400).send({
                message: `Data was not saved and file have been deleted`,
                err
            })
            return;
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: `Server error, Something broke`, error })
    }

}


//user
exports.getDashboard = async (req, res) => {
    try {
        const productCategoriesObject = await productCategoryModel.find({});
        const productCategories = productCategoriesObject[0].productCategories;
        let topRatedProducts = await productsHelper.gettopRatedProducts();
        var productOfEachCategory = await productsHelper.getProductOfEachCategory(productCategories);

        res.status(200).send({
            msg: `Got the data`,
            topRatedProducts,
            productOfEachCategory
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Server error, Something broke`,
            error
        })
    }
}

exports.searchForProduct = async (req, res) => {
    try {
        let searchKeyword = new RegExp(req.params.keyword);
        const products = await productModel.find({ productName: { $regex: searchKeyword, $options: 'i' } });
        let noOfProducts = products.length;
        let searchResult = [];
        for (let j = 0; j < noOfProducts; j++) {
            let filteredProductData = await productsHelper.filterProductData(products[j]);
            searchResult.push(filteredProductData);
        }
        return res.status(200).send({
            searchResult
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Server error, Something broke`,
            error
        })
    }
}

exports.getCommonProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        let noOfProducts = products.length;
        let commonProducts = [];
        let filteredData;
        let serverCategoryData = await productCategoryModel.find({});
        let allCategories = serverCategoryData[0].productCategories;

        let serverColorData = await productColorModel.find({});
        let allColors = serverColorData[0].productColors;

        for (let j = 0; j < noOfProducts; j++) {
            filteredData = await productsHelper.filterProductData(products[j]);
            commonProducts.push(filteredData);
        }
        return res.status(200).send({
            commonProducts,
            allCategories,
            allColors
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Server error, Something broke`,
            error
        })
    }
}

exports.filterCommonProducts = async (req, res) => {
    try {
        if ((!req.body.categories && !req.body.colors) || (!(req.body.categories.length || req.body.colors.length)))
            throw `filters need to be provided for this api`

        let products = await productModel.find({});
        let noOfProducts = products.length;
        if (req.body.sort) {
            products = await productsHelper.sortProducts(products, req.body.sort.basedOn, req.body.sort.order)
        }
        else
            products = await productsHelper.sortProducts(products, 'rating', 'desc');

        let serverCategoryData = await productCategoryModel.find({});
        let allCategories = serverCategoryData[0].productCategories;

        let serverColorData = await productColorModel.find({});
        let allColors = serverColorData[0].productColors;

        let filteredData, categories, colors, filteredcommonProducts = [];

        if (req.body.categories && req.body.categories.length > 0) {
            categories = req.body.categories;
        }
        if (req.body.colors && req.body.colors.length > 0) {
            colors = req.body.colors;
        }

        for (let j = 0; j < noOfProducts; j++) {
            //need to send filterdata and eachproduct            
            if (categories && colors) {
                if (categories.includes(products[j].productCategory)) {
                    filteredData = await productsHelper.filterForColors(colors, products[j]);
                    if (filteredData)
                        filteredcommonProducts.push(filteredData);
                }
            }
            else if (categories) {
                filteredData = await productsHelper.filterForCategories(categories, products[j]);
                if (filteredData)
                    filteredcommonProducts.push(filteredData);
            }
            else if (colors) {
                filteredData = await productsHelper.filterForColors(colors, products[j]);
                if (filteredData)
                    filteredcommonProducts.push(filteredData);
            }
        }
        let msg = `success`
        if (filteredcommonProducts.length === 0)
            msg = `No products under the given filter`
        return res.status(200).send({
            msg,
            filteredcommonProducts
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Server error, Something broke`,
            error
        })
    }
}

exports.getProductDetails = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        const productImages = await productsHelper.getProductImagesDefaultColor(product);
        res.status(200).send({
            message: `Got the data`,
            name: product.productName,
            rating: product.rating.average,
            price: product.productPrice,
            colors: product.productColors,
            description: product.productDesc,
            features: product.productFeatures,
            images: productImages
        })
    } catch (error) {
        res.status(500).send({
            message: `Server error, Something broke`,
            error
        })
    }
}

exports.addProductToCart = async (req, res) => {
    try {
        const param = req.params.id;
        const params = param.split('&');
        const user = await userModel.findById(res.locals.userId);
        const product = await productModel.findById(params[0]);
        const productColorSelected = params[1];
        let cart = await cartModel.findById(user.cartId);
        if (!product)
            throw `Product doesn't exist`
        if (!(product.productColors.includes(productColorSelected)))
            throw `Product Color doesn't exist`

        if (cart.productIds.includes(product._id)) {
            cart = await productsHelper.addQuantity(cart, product, productColorSelected);
        }
        else {
            cart = await productsHelper.addNewProduct(cart, product, productColorSelected);
        }
        cart.save(cart).then(cartData => {
            res.status(200).send({
                message: `success`,
                cartData
            })
        }).catch(err => {
            return res.status(400).send({
                message: `Error occurred while saving Cart data`,
                err
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.addProductRating = async (req, res) => {
    try {
        const param = req.params.id;
        const params = param.split('&');
        let product = await productModel.findById(params[0]);

        if (!(params[1] < 5 && params[1] > 0))
            throw `Rating has to be between 0 and 5`
        if (!product)
            throw `Product doesn't exist`
        product.rating.count += 1;
        product.rating.users.push(res.locals.userId);

        let avgRating = product.rating.average;
        let ratingCount = product.rating.count;

        if (avgRating === 0) {
            product.rating.average += params[1];
        }
        else {
            let receivedRating = parseInt(params[1])
            product.rating.average = (((avgRating * (ratingCount - 1)) + receivedRating) / (ratingCount)).toFixed(2);
            console.log(`after math`, product.rating.average);
        }

        await productsHelper.addRatingToServerData(params[0], product.rating);

        product.save(product).then(data => {
            return res.status(200).send({
                'Product Rating': data.rating
            })
        })
        // res.status(400).send({
        //     'Product Rating': product.rating
        // })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }

}

//test apis
exports.uploadedFiles = async (req, res) => {
    console.log(`The files: `, req.files.images);
    const color = req.body.color;
    $color = [];

    const tempFilesStorage = req.files.images;
    tempFilesStorage.forEach(image => {
        let productImages = {
            filename: image.filename,
            destination: image.destination,
            fileType: image.mimetype
        }
        $color.push(productImages)
    });
    $color.forEach(file => {
        console.log(file.filename);
    })

    res.status(200).send({
        message: `Uploaded successfully`,
        $color
    })
}