const productModel = require('../models/product.model');
const productCategoryModel = require('../models/productCategories.model');
const productColorModel = require('../models/productColors.model');
const productsHelper = require('../helpers/products.helper');
const userModel = require('../models/user.model');
const cartModel = require('../models/cart.model');
const app = require('../config/default.json')

//main apis
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
            res.status(200).send({
                message: `Product saved to DB`,
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
        res.status(500).send({ message: `Server error, Something broke` })
    }

}

exports.getDashboard = async (req, res) => {
    try {
        const productCategoriesObject = await productCategoryModel.find({});
        const productCategories = productCategoriesObject[0].productCategories;
        // var topRatedProducts = await productsHelper.gettopRatedProducts(productCategories);
        var productOfEachCategory = await productsHelper.getProductOfEachCategory(productCategories);

        res.status(200).send({
            msg: `Got the data`,
            topRatedProducts: `getting top rated products`,
            productsOfAllCategories: productOfEachCategory
        });

    } catch (error) {
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
        const user = await userModel.findById(res.locals.userId);
        const product = await productModel.findById(req.params.id);
        if (!product) {
            throw new Error
        }
        const cart = await cartModel.findById(user.cartId);
        if (cart.productIds.includes(product._id)) {
            // add the quantity by 1 and change price accordingly
            let j = 0, noOfProducts = cart.productIds.length;
            while (j < noOfProducts) {
                console.log(`checking ${cart.productDetails[j].productId}`);
                console.log(cart.productDetails[j].productId, product._id);
                if (cart.productDetails[j].productId === product._id) {
                    console.log(`found the match`);
                    cart.productDetails[j].orderQuantity++;
                    cart.productDetails[j].total += cart.total;
                    if (cart.subTotalPrice === undefined)
                        cart.subTotalPrice = product.productPrice;
                    else
                        cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
                    cart.totalPrice = 1.05 * cart.subTotalPrice;
                    console.log(j, cart);
                    j = cart.productIds.length;
                }
                j++;
            }
            // for (j = 0; j++; j < 2) {
            //     let productInCart = cart.productDetails[j];
            //     console.log(`checking ${productInCart.productId}`);
            //     if (productInCart.productId === product._id) {
            //         productInCart.orderQuantity++;
            //         productInCart.total += cart.total;
            //         if (cart.subTotalPrice === undefined)
            //             cart.subTotalPrice = product.productPrice;
            //         else
            //             cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
            //         cart.totalPrice = 1.05 * cart.subTotalPrice;
            //         j = cart.productIds.length;
            //     }
            // }
        } else {
            cart.productIds.push(product._id);
            cart.productDetails = {
                productId: product._id,
                productName: product.productName,
                productSeller: product.productSeller,
                productStock: product.productStockCount,
                orderQuantity: 1,
                productPrice: product.productPrice,
                total: product.productPrice,
            }
            if (cart.subTotalPrice === undefined)
                cart.subTotalPrice = product.productPrice;
            else
                cart.subTotalPrice = cart.subTotalPrice + product.productPrice;
            cart.totalPrice = 1.05 * cart.subTotalPrice;
        }
        res.status(200).send({ cart });
        // cart.save(cart).then(cartData => {
        //     res.status(200).send({
        //         message: `success`,
        //         cart
        //     })
        // }).catch(err => {
        //     return res.status(400).send({
        //         message: `Error occurred while saving Cart data`,
        //         err
        //     })
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