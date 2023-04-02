const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middelware/checkAuth');

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec()
        .then((result) => {
            res.status(200).json({ count: result.length, result: result });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
        .then((product) => {
            if (!product) {
                res.status(404).json({ message: 'product not found' });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId,
            });

            return order.save();
        })
        .then((result) => {
            res.status(201).json(result);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;

    Order.findById(id)
        .populate('product', 'name price')
        .exec()
        .then((order) => {
            if (!order) res.status(404).json({ message: 'No order found' });
            res.status(200).json({ order: order });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

router.patch('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: `patch request for ${id}`,
    });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;

    Order.remove({ _id: id })
        .exec()
        .then((order) => {
            res.status(200).json({ order: order });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;
