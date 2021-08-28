const productModel = require('../models/product.model');
const productUpload = require('../helpers/checkReqBody.helper');
const deleteFile = require('../helpers/deleteFile.helper');

//main apis
exports.addProduct = async (req, res) => {
    try {
        // let message = checkReqBody(req.body);
        // if (message) {
        //     res.status(400).send({ message })
        //     return;
        // }
        const productImagesArray = await getFileDetails(req.files.images);

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
            await deleteFiles(req.files.images);

            res.status(402).send({
                message: 'Product not saved to DB',
                err,
                errorMessage: err.message
            })
        })
    } catch (error) {
        res.status(500).send({
            messgae: `Server error. Something broke`
        })
    }
}

exports.addProductImages = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
    const productImagesArray = await getFileDetails(req.files.images);
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
        await deleteFiles(req.files.images);
        res.status(400).send({
            message: `Data was not saved and file have been deleted`,
            err
        })
        return;
    })
    } catch (error) {
        res.status(500).send({message:`Server error, Something broke`})
    }
    
}

exports.getProducts = async (req, res ) => {
    const products = productModel.find()
}

exports.getProductDetails = async (req, res) => {}

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
        deleteFile(`./images/${image.filename}`)
    });
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