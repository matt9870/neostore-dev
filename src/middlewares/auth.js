const jwt = require('jsonwebtoken');
const userData = require('../models/user.model');
const secretKey = require('../config/auth.config');
const bcrypt = require('bcrypt');

exports.generateToken = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    userData.find({ email }, (err, user) => {
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
        var token = jwt.sign({
            id: user[0]._id,
            type: `customer`
        },
            secretKey.secret, { expiresIn: 3000 });
        if (!token) {
            return res.status(400).json({
                message: `User not authenticated!`,
            })
        }
        res.locals.currentUser = { id: user[0].id, email: user[0].email, token };
        next();
    })
}

exports.generateRegisterToken = async (req, res) => {
    var token = jwt.sign({
        id: res.locals.currentUser.userId,
        type: `customer`
    },
        secretKey.secret, { expiresIn: 3000 });
    if (!token) {
        return res.status(400).json({
            message: `User not authenticated!`,
        })
    }
    res.locals.currentUser.token = token;
    return res.status(200).send({
        message: `User register succesfully and token generated`,
        userId: res.locals.currentUser.userId,
        cartId: res.locals.currentUser.cartId,
        token
    })

}

exports.verifyToken = async (req, res, next) => {
    let bearerToken = await req.headers["authorization" || 'Authorization'];
    if (!bearerToken) {
        return res.status(403).json({
            message: "No token provided - User is not authorized!"
        })
    }
    let bearerTokenParts = bearerToken.split(' ');
    let token = bearerTokenParts[1];
    jwt.verify(token, secretKey.secret, (err, result) => {
        if (err) {
            console.log("Token invalid");
            res.status(403).json({ message: "Unauthorized", token: 'Invalid' })
            return;
        }
        else {
            res.locals.userId = result.id;
            next();
        }
    })
}