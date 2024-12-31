const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Product} = require('../models');

const createProduct = async (req, res) => {
    try {
        let { name, price, reference } = req.body;
        const existingRef = await Product.findOne({ where: { reference } });

        if (existingRef) {
            return res.status(400).json({ message: 'Product Reference Already Exist' });
        }

        if (!name, !price) {
            return res.status(400).json({ message: 'Please verify your inputs' });
        }

        const newProduct = await Product.create({ name, price, reference });
        return res.status(201).json({
            message: 'Product Created!',
            product: newProduct.toJSON(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { createProduct };