const express = require('express');
const productController = require('../controllers/products.controller');
const upload = require('../helpers/uploadFiles.helper');
const auth = require('../middlewares/auth');
const productRouter = new express.Router();

//main apis
productRouter.post('/addNewProduct', upload.fields([{
    name: `images`, maxCount: 5
}]), productController.addProduct, (req, res) => {
    res.json({ res });
})

productRouter.post('/addProductImages/:id', upload.fields([{
    name: `images`, maxCount: 5
}]), productController.addProductImages, (req, res) => {
    res.json({ res })
})

productRouter.get('/getDashboard', productController.getDashboard, (req, res) => {
    res.json({ res });
})

productRouter.get('/getProductDetails/:id', productController.getProductDetails, (req, res) => {
    res.json({ res })
})

productRouter.post('/addToCart/:id', auth.verifyToken, productController.addProductToCart, (req, res) => {
    res.json({ res });
})

//other apis for testing purposes
productRouter.post('/uploadFiles', upload.fields([{
    name: `images`, maxCount: 5
}]), productController.uploadedFiles, async (req, res) => {
    await res.json({ res });
})

module.exports = productRouter;