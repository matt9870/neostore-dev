const express = require('express');
const userController = require('../controllers/user.controller');
const upload = require(`../helpers/uploadProfilePic.helper`);
const auth = require('../middlewares/auth');
const userRouter = new express.Router();

userRouter.post('/register', upload.single(`profile-pic`), userController.registerUser, auth.generateRegisterToken, (req, res) => {
    res.json({ res });
})

userRouter.post(`/login`, auth.generateToken, userController.login, (req, res) => {
    res.json({ res });
})


module.exports = userRouter;