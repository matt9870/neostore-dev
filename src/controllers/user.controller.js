const userModel = require('../models/user.model');
const cartModel = require(`../models/cart.model`);
const app = require('../config/default.json');
const deleteFile = require('../helpers/deleteFile.helper');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.registerUser = async (req, res, next) => {
    try {
        const userProfilePic = req.file;
        if (!req.file) {
            deleteFile(`./images/user/${userProfilePic.filename}`);
            res.status(400).send({ message: "Upload an image in jpeg/jpg/png format or File was not uploaded" });
            return;
        }
        let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new userModel({
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            contactNo: req.body.contactNo,
            email: req.body.email,
            password: hashedPassword,
            profile_pic: {
                filename: userProfilePic.filename,
                destination: userProfilePic.destination,
                fileType: userProfilePic.mimetype
            },
            gender: req.body.gender.toLowerCase()
        })
        const newCart = new cartModel({
            userId: newUser._id,
            userEmail: newUser.email
        })
        newUser.cartId = newCart._id;

        newUser.save(newUser).then(userData => {
            newCart.save(newCart).then(cartData => {
                res.locals.currentUser = {
                    userId: userData.id,
                    email: userData.email,
                    cartId: cartData._id
                }
                next();
            }).catch(err => {
                deleteFile(`./images/user/${userProfilePic.filename}`);
                res.status(400).send({
                    message: `Error while saving user data`,
                    errorMessage: err.message,
                    err
                })
            })
        }).catch(err => {
            deleteFile(`./images/user/${userProfilePic.filename}`);
            res.status(400).send({
                message: `Error while saving user data`,
                errorMessage: err.message,
                err
            })
        })
    } catch (error) {
        deleteFile(`./images/user/${userProfilePic.filename}`);
        console.log(error);
        res.status(500).send({
            messgae: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.login = async (req, res) => {
    try {
        const userId = res.locals.currentUser.id;
    if (userId) {
        return res.status(200).send({ msg: 'user found', user: res.locals.currentUser });
    }
    else
        return res.status(400).send({ msg: 'no user found' })
    } catch (error) {
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`
        })
    }
    
}