const express = require('express');
const userController = require('../controllers/user.controller');
const upload = require(`../helpers/uploadProfilePic.helper`);
const auth = require('../middlewares/auth');
const userRouter = new express.Router();

//User Authentication, recover password
userRouter.post('/register', upload.single(`profile-pic`), userController.registerUser, auth.generateRegisterToken, (req, res) => {
    res.json({ res });
})

userRouter.post(`/login`, auth.generateToken, userController.login, (req, res) => {
    res.json({ res });
})

userRouter.post(`/forgotPassword`, userController.sendVerificationCode, (req, res) => {
    res.json({ res });
})

userRouter.post(`/recoverPassword`, userController.resetPassword, (req, res) => {
    res.json({ res });
})


/******************************************************************************************* */
//user product management
userRouter.get('/getCart', auth.verifyToken, userController.getCartDetails, (req, res) => {
    res.json({ res });
})

userRouter.post('/updateCart', auth.verifyToken, userController.updateCartDetails, (req, res) => {
    res.json({ res });
})

userRouter.get(`/proceedToBuy`, auth.verifyToken, userController.getCustomerAddress, (req, res) => {
    res.json({ res });
})

userRouter.post(`/proceedToCheckout/:id`, auth.verifyToken, userController.proceedToCheckout, (req, res) => {
    res.json({ res });
})//id is the cart id

userRouter.get(`/reviewOrderDetails/:id`, auth.verifyToken, userController.reviewOrderDetails, (req, res) => {
    res.json({ res });
})//id is the order id

userRouter.post(`/placeOrder/:id`, auth.verifyToken, userController.placeOrder, (req, res) => {
    res.json({ res });
})//id is the order id


/****************************************************************************************** */
//user profile management
userRouter.get('/profile', auth.verifyToken, userController.getProfileDetails, (req, res) => {
    res.json({ res });
})

userRouter.post('/updateprofile', auth.verifyToken, userController.updateProfileDetails, (req, res) => {
    res.json({ res });
})

userRouter.get('/getCustAddress', auth.verifyToken, userController.getCustomerAddress, (req, res) => {
    res.json({ res });
})

userRouter.get('/getOrders', auth.verifyToken, userController.getOrdersDetails, (req, res) => {
    res.json({ res });
})

userRouter.post('/addCustAddress', auth.verifyToken, userController.addCustomerAddress, (req, res) => {
    res.json({ res });
})

userRouter.post('/changePassword', auth.verifyToken, userController.changePassword, (req, res) => {
    res.json({ res });
})

module.exports = userRouter;