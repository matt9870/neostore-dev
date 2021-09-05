const express = require('express');
require('./db/mongoose');
const multer = require('multer');
const passport = require('passport');

//Importing routers
const userRouter = require('./routers/user.router');
const orderRouter = require('./routers/orders.router');
// const checkoutRouter = require('./routers/checkout.router');
const productRouter = require('./routers/products.router');
const productDefaultDataRouter = require('./routers/productDefaultData.router');

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Using routers
app.use(userRouter);
// app.use(orderRouter);
app.use(productDefaultDataRouter);
app.use(productRouter);

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

app.get('/', (req, res) => {
    console.log(`requested homepage`);
    res.send('Homepage');
});

module.exports = app;