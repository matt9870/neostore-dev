const express = require('express');
const dataController = require('../controllers/serverData.controller');

const dataRouter = new express.Router();

dataRouter.post('/addProductCategories', dataController.addProductCategories, (req,res) => {
    res.json({res});
})

dataRouter.get('/getProductCategories', dataController.getProductCategories, (req,res) => {
    res.json({res});
})

module.exports = dataRouter;