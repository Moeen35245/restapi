const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                return res.status(422).json({ message: `email already exist` });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: err, msg: 'bcrypt failed' });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });
                        user.save()
                            .then((result) => {
                                res.status(201).json({ _id: result._id, email: result.email, message: 'user created' });
                            })
                            .catch((err) => {
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({ message: 'Auth failed' });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({ message: 'Auth failed' });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id,
                        },
                        'moinuddin',
                        {
                            expiresIn: '1h',
                        }
                    );

                    return res.status(200).json({ message: 'Auth successful', token: token });
                }
                res.status(401).json({ message: 'Auth failed' });
            });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.remove({ _id: id })
        .exec()
        .then((user) => {
            res.status(200).json({ user: user, message: 'user deleted' });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;
