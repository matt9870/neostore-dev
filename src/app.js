const express = require('express');
require('./db/mongoose');
const multer = require('multer');
const passport = require('passport');
require('./config/passport.config');
const swaggerUi = require("swagger-ui-express");

//Importing routers
const userRouter = require('./routers/user.router');
const productRouter = require('./routers/products.router');
const productDefaultDataRouter = require('./routers/productDefaultData.router');

const app = express();

app.use(express.json());

//passport for SSO integration
app.use(passport.initialize());
app.use(passport.session());

//importing swagger json file and serving the same
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(require(path.resolve(`${__dirname}/../swagger/swagger.json`)))
);

//Using routers
app.use(userRouter);
app.use(productDefaultDataRouter);
app.use(productRouter);


//User authentication using Google
app.get('/googleAuth', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // console.log(req.user);
        res.redirect('/loginWithGoogle?user='+ JSON.stringify(req.user));
    });

//Error Handler
app.use(function (err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(418).send({ message: 'File is too large or needs to be in jpg/png/jpeg format' });
    }
    console.log(err)
    res.status(500).send({
        message: 'Something broke!',
        err
    })
})

//homepage
app.get('/', (req, res) => {
    console.log(`requested homepage`);
    res.send('Homepage');
});

module.exports = app;