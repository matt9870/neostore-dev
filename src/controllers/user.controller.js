const userModel = require('../models/user.model');
const cartModel = require(`../models/cart.model`);
const orderModel = require('../models/orders.model');
const serverDataModel = require('../models/productCategories.model');

const moment = require('moment');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = require('../config/default.json');
const deleteFile = require('../helpers/deleteFile.helper');
var sendEmailHelper = require('../helpers/sendResetEmail.helper');
const userHelper = require('../helpers/user.helper');
var generator = require('generate-password');


//User Authentication, recover password
exports.registerUser = async (req, res, next) => {
    try {
        const userProfilePic = req.file;
        if (!req.file || !userProfilePic) {
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
                    message: `User registered successfully!`,
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

/**exports.login = async (req, res) => {
    try {
        const userId = res.locals.currentUser.id;
        const user = await userModel.findById(userId);
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

} */

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
                message: `Code is incorrect or has expired. To reset password generate another code and try again`
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

exports.verifyUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    userModel.find({ email }, (err, user) => {
        if (err || user.length === 0) {
            return res.status(400).send({
                message: `User Not Found! Check username and try again\n Error: ${err}`
            })
        }
        var passwordMatch = bcrypt.compareSync(password, user[0].password);
        if (!passwordMatch) {
            return res.status(400).send({
                message: `Credentials not valid, enter correct password`
            })
        }
        res.locals.currentUser = {
            message:`User verified!`,
            userId: user[0]._id,
            email: user[0].email,
            cartId: user[0].cartId
        }
        next();
    })
}

exports.verifySSO = async (req, res, next) => {
    try {
        let user = JSON.parse(req.query.user);
        let username = await user.displayName;
        let profilePic = await user.picture;
        let SSOprovider = await user.provider;
        let email = await user.email;

        userModel.find({ email }, async (err, user) => {
            if (user.length !== 0) {
                res.locals.currentUser = {
                    message: `User authenticated.`,
                    userId: user[0].id,
                    email: user[0].email,
                    cartId: user[0].cartId
                }
                next();
            }
            else {
                var password = generator.generate({
                    length: 8
                });
                console.log(password);
                let hashedPassword = await bcrypt.hash(password, 8);

                let usernameArray = username.split(' ');

                let newUser = new userModel({
                    firstName: usernameArray[0],
                    secondName: usernameArray[1],
                    email,
                    profile_pic: {
                        filename: profilePic
                    },
                    SSOprovider,
                    password: hashedPassword
                })
                const newCart = new cartModel({
                    userId: newUser._id,
                    userEmail: newUser.email
                })
                newUser.cartId = newCart._id;

                newUser.save(newUser).then(data => {
                    newCart.save(newCart).then(() => {
                        res.locals.currentUser = {
                            message: `User registered successfully.`,
                            userId: data.id,
                            email: data.email,
                            cartId: data.cartId
                        }
                        next();
                    })
                })
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

/******************************************************************************** */
//Product management
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

exports.proceedToCheckout = async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.id);
        const user = await userModel.findById(res.locals.userId);
        if (!cart || cart.productDetails.length === 0)
            throw `Cart not found or doesnt have any products added`
        if (!req.body.address && !req.body.newAddress)
            throw `Address should be sent in req.body to place order`

        let order = new orderModel({
            userId: cart.userId,
            userName: user.firstName + ' ' + user.secondName,
            userEmail: cart.userEmail,
            productDetails: cart.productDetails,
            subTotalPrice: cart.subTotalPrice,
            totalPrice: cart.totalPrice
        })
        if (req.body.newAddress) {
            let duplicateAddressStatus = true;
            duplicateAddressStatus = await userHelper.checkForDuplicateAddress(user.addresses, req.body.newAddress);
            if (duplicateAddressStatus)
                throw `Address already exists and or limit for adding address has reached`
            else {
                console.log(`adding the new address to order object`);
                order.address = req.body.newAddress;
                user.addresses.push(req.body.newAddress);
                user.save(user).then(() => {
                    order.save(order).then(data => {
                        return res.status(200).send({
                            message: `success`,
                            data
                        })
                    }).catch(err => { throw `Error while saving order data` })
                }).catch(err => { throw `Error while saving address to user` })
            }
        }
        else {
            console.log(`adding existing address to order`);
            order.address = req.body.address;

            order.save(order).then(data => {
                res.status(200).send({
                    message: `success`,
                    data
                })
            }).catch(err => { throw `Error while saving order data - ${err}` })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.reviewOrderDetails = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if (!order)
            throw `Order not found`
        const formatted = moment(order.createdAt).format('DD MM YYYY, h:mm:ss a');
        let orderCreationTime = moment(order.createdAt, 'MMMM Do YYYY, h:mm:ss a').fromNow();
        res.status(200).send({
            message: `Order was created on ${formatted}`,
            additionalMessage: `Order was created ago ${orderCreationTime}`,
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

exports.placeOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        const serverDataArray = await serverDataModel.find({});
        const serverData = await serverDataModel.findById(serverDataArray[0]._id);

        if (!order)
            throw `Order not found`
        const user = await userModel.findById(res.locals.userId);
        if (!user)
            throw `User was not found`
        if (order.status)
            throw `Attempting to place an order that has already been placed`
        order.status = true;
        user.orders.push(order._id);

        let products = await userHelper.getProductDetails(order.productDetails);
        let address = order.address.address + ', ' + order.address.city + ', ' + order.address.state + ', ' + order.address.country + ', Pincode: ' + order.address.pincode;
        let name = user.firstName + ' ' + user.secondName;


        //generating unique order Id for sharing with customer
        order.orderId = serverData.orderId;
        serverData.orderId++;
        //creating an invoice pdf
        let { destination, filename } = await userHelper.generateInvoice(order);
        if (destination === undefined)
            throw `error while creating the invoice`
        order.invoice = filename;
        user.save(user).then(() => {
            order.save(order).then(orderData => { //need to save serverData
                serverData.save(serverData).then(() => {
                    return res.status(200).send({
                        message: `Order has been placed for ${name} at ${address}`,
                        products,
                        costBeforeTax: orderData.subTotalPrice,
                        totalCost: orderData.totalPrice
                    })
                }).catch(err => { throw `error while saving server data - ${err}` })
            }).catch(err => { throw `error while saving order data - ${err}` });
        }).catch(err => { throw `error while saving user data - ${err}` });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}


/******************************************************************************** */
//User Profile management
exports.getProfileDetails = async (req, res) => {
    try {
        console.log(`userId - `,res.locals.userId);
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

exports.getOrdersDetails = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        let noOfOrders = user.orders.length;
        let ordersDetails = [];
        for (let j = 0; j < noOfOrders; j++) {
            let currentOrder = await orderModel.findById(user.orders[j]);
            let productsInOrder = await userHelper.getProductDetails(currentOrder.productDetails);
            let orderTime = moment(currentOrder.createdAt).format('DD MM YYYY, h:mm:ss a');
            let orderDuration = moment(currentOrder.createdAt, 'MMMM Do YYYY, h:mm:ss a').fromNow();
            ordersDetails.push({
                orderPlacedOn: `Order was placed on ${orderTime},  ${orderDuration}`,
                productsInOrder,
                totalPrice: currentOrder.totalPrice
            })
        }
        return res.status(200).send({
            message: `success`,
            ordersDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `${app.APP.SERVER.ERROR}`,
            error
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const user = await userModel.findById(res.locals.userId);
        if (!req.body.currentPassword && !req.body.newPassword)
            throw `An old and new passwords needs to provided`;

        let currentPassword = req.body.currentPassword;
        let passwordMatches = bcrypt.compareSync(currentPassword, user.password);

        if (passwordMatches) {
            if (req.body.currentPassword === req.body.newPassword)
                throw `Old and new password is same`;
            user.password = await bcrypt.hash(req.body.newPassword, saltRounds);
            user.save(user).then(() => {
                return res.status(200).send({
                    message: `Password has been changed successfully`
                });
            }).catch(err => { throw `Error while saving new password to DB - ${err}` });
        }
        else
            return res.status(400).send({ message: `Password incorrect!` })
    }
    catch (error) {
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