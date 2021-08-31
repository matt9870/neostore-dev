const userModel = require('../models/user.model');
const cartModel = require(`../models/cart.model`);
const app = require('../config/default.json');
const deleteFile = require('../helpers/deleteFile.helper');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var sendEmailHelper = require('../helpers/sendResetEmail.helper');
const orderModel = require('../models/orders.model');

exports.registerUser = async (req, res, next) => {
    try {
        const userProfilePic = req.file;
        if (!req.file || !userProfilePic) {
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
        const user= await userModel.findById(userId);
        if (userId) {
            return res.status(200).send({ msg: 'user found', user: res.locals.currentUser, "cart Id": user.cartId });
        }
        else
            return res.status(400).send({ msg: 'no user found' })
    } catch (error) {
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`
        })
    }

}

exports.sendVerificationCode = async (req, res) => {
    try {
        const receiverEmail = req.body.email;
        let userArray = await userModel.find({ email: receiverEmail });
        if (userArray.length === 0)
            throw `email doesn't belong to an existing user. Check email or create an account to proceed`
        let user = await userModel.findById(userArray[0]._id);
        let code = Math.floor(Math.random() * 88888) + 11111;
        let emailStatus = await sendEmailHelper.sendResetCode({
            receiverEmail,
            code,
            resetUrl: `http://localhost:3000/recoverPassword`
        })
        user.resetCode = code;
        user.save(user).then(data => {
            res.status(200).send({
                message: `success`,
                code: data.resetCode,
                emailStatus
            })
        }).catch(err => { throw err })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const userArray = await userModel.find({ resetCode: req.body.verificationCode });
        if (userArray.length === 0) {
            return res.status(400).send({
                message: `Code has expired to reset password, Generate another code and try again`
            })
        }

        let user = await userModel.findById(userArray[0]._id);
        let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        user.password = hashedPassword;
        user.resetCode = '';
        user.save(user).then(() => {
            res.status(200).send({ message: `Password has been reset successfully` })
        }).catch(err => { throw err })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.getCartDetails = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        const cart = await cartModel.findById(user.cartId)
        if (!cart)
            throw `Cart not found`
        res.status(200).send({
            message: `success`,
            cart
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.updateCartDetails = async (req, res) => {
    try {
        const newCartData = req.body.cart;
        // const user = await userModel.findById(res.locals.userId);
        let cart = await cartModel.findById(newCartData._id);
        if (!cart)
            throw `Cart was not found`
        let noOfProducts = newCartData.productIds.length;
        if (noOfProducts === 0) {
            cart.productIds = [];
            cart.productDetails = [];
            cart.subTotalPrice = 0;
            cart.totalPrice = 0;
        }
        else {
            cart.subTotalPrice = 0;
            cart.productIds = newCartData.productIds;
            cart.productDetails = newCartData.productDetails;
            for (let j = 0; j < noOfProducts; j++) {
                cart.subTotalPrice += cart.productDetails[j].total;
            }
            cart.totalPrice = 1.05 * cart.subTotalPrice;
        }
        cart.save(cart).then(cartData => {
            return res.status(200).send({
                message: `success`,
                cartData
            })
        }).catch(err => {
            return res.status(400).send({
                message: `Error occurred while saving Cart data`,
                err
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.getProfileDetails = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        if (!user)
            throw `user data was not found`
        let userData = {
            userId: user._id,
            firstName: user.firstName,
            secondName: user.secondName,
            gender: user.gender,
            mobile: user.contactNo,
            email: user.email
        }
        res.status(200).send({
            message: 'success',
            userData
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }

}

exports.updateProfileDetails = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        const newProfileDetails = req.body.profileDetails;
        if (!user)
            throw `user data was not found`
        if (newProfileDetails.firstName)
            user.firstName = newProfileDetails.firstName;
        if (newProfileDetails.secondName)
            user.secondName = newProfileDetails.secondName;
        if (newProfileDetails.gender)
            user.gender = newProfileDetails.gender;
        if (newProfileDetails.mobile)
            user.mobile = newProfileDetails.mobile;
        user.save(user).then(data => {
            res.status(200).send({
                message: `success`,
                data
            })
        }).catch(err => {
            throw err;
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.getCustomerAddress = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        if (!user || !user.addresses)
            throw `user data or addresses were not found`
        if (user.addresses.length === 0) {
            res.status(200).send({
                message: `success`,
                address: `no address found`
            })
        } else
            res.status(200).send({
                message: `success`,
                "Default Address Id": user.defaultAddress,
                "Addresses": user.addresses
            })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }

}

exports.addCustomerAddress = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        if (!user || !req.body.address)
            throw `user data or new address to added were not found`
        const newAddress = req.body.address;
        let noOfAddress = user.addresses.length;

        if (noOfAddress === 0) {
            user.addresses.push({
                address: newAddress.address,
                pincode: newAddress.pincode,
                city: newAddress.city,
                state: newAddress.state,
                country: newAddress.country
            })
            user.defaultAddress = user.addresses[0]._id;
        }
        else {
            for (let j = 0; j < noOfAddress; j++) {
                if (user.addresses[j].address === newAddress.address)
                    throw `Address already exists for the user`
            }
            user.addresses.push({
                address: newAddress.address,
                pincode: newAddress.pincode,
                city: newAddress.city,
                state: newAddress.state,
                country: newAddress.country
            })
        }
        user.save(user).then(data => {
            res.status(200).send({
                message: `success`,
                defAddress: user.defaultAddress,
                addresses: user.addresses
            })
        }).catch(err => {
            throw err;
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }

}

exports.proceedToCheckout = async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.id);
        const user = await userModel.findById(res.locals.userId);
        if (!cart || cart.productDetails.length === 0)
            throw `Cart not found or doesnt have any products added`
        if(!req.body.address || !req.body.newAddress)
            throw `Address is to be sent in req.body to place order`
        // if(await checkForDuplicateAddress(user.addresses, req.body.newAddress))
        //     throw `The new address provided is already saved. Use a different one`
        let order = new orderModel({
            userId: cart.userId,
            userName: user.firstName + ' ' + user.secondName,
            userEmail: cart.userEmail,
            productDetails: cart.productDetails,
            subTotalPrice: cart.subTotalPrice,
            totalPrice: cart.totalPrice
        })
        if(req.body.newAddress) {
            console.log(`adding the new address to order object`);
            order.address= req.body.newAddress;
            user.addresses.push(req.body.newAddress);
            // user.save(user).then(()=>{
            //     order.save(order).then(data =>{
            //         return res.status(200).send({
            //             message:`success`,
            //             data
            //         })
            //     }).catch(err => {throw `Error while saving order data`})
            // }).catch(err => {throw `Error while saving address to user`})
        }else{
            console.log(`adding existing address to order`);
            order.address = req.body.address;
            // order.save(order).then(data =>{
            //     res.status(200).send({
            //         message:`success`,
            //         data
            //     })
            // }).catch(err => {throw `Error while saving order data`})
        }
        return res.status(200).send({
            message: `success`,
            order
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

//async function checkForDuplicateAddress(userAddresses, newAddress){}

exports.reviewOrderDetails = async (req, res) => { }
exports.placeOrder = async (req, res) => { }