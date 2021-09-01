const express = require('express');
const productController = require('../controllers/products.controller');
const upload = require('../helpers/uploadFiles.helper');
const auth = require('../middlewares/auth');
const productRouter = new express.Router();

//main apis

//admin
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

/*********************************************************************************** */
//user
productRouter.get('/getDashboard', productController.getDashboard, (req, res) => {
    res.json({ res });
})

productRouter.post('/find/:keyword', productController.searchForProduct, (req,res) => {
    res.json({res});
})

productRouter.get('/commonProducts', productController.getCommonProducts, (req,res) => {
    res.json({res});
})

productRouter.post('/commonProducts', productController.filterCommonProducts, (req,res) => {
    res.json({res});
})


productRouter.get('/getProductDetails/:id&:color', productController.getProductDetails, (req, res) => {
    res.json({ res })
})

productRouter.post('/addToCart/:id', auth.verifyToken, productController.addProductToCart, (req, res) => {
    res.json({ res });
})

productRouter.post(`/addRating/:id`,auth.verifyToken, productController.addProductRating, (req,res) => {
    res.json({res});
})

//other apis for testing purposes
productRouter.post('/uploadFiles', upload.fields([{
    name: `images`, maxCount: 5
}]), productController.uploadedFiles, async (req, res) => {
    await res.json({ res });
})

module.exports = productRouter;