const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middelware/checkAuth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then((result) => {
            const response = {
                count: result.length,
                products: result,
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
    });
    product
        .save()
        .then((result) => {
            console.log(result);

            res.status(201).json({
                message: 'post request for /products',
                createdProduct: result,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then((result) => {
            console.log(result);
            if (result) res.status(200).json(result);
            else res.status(404).json({ error: 'Not found' });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.updateMany({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
