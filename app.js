require('dotenv').config();
const express = require('express');
const app = express();
// console.log(process.env.PORT, process.env.MONGO_URL);
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL);

const productRouter = require('./api/routes/product');
const orderRouter = require('./api/routes/orders');
const userRouter = require('./api/routes/users');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
//         return res.status(200).json({});
//     }
// });
// we can set '*' or we can only one like "http://www.mysite.com"

app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/users', userRouter);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
module.exports = app;
