const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Shift, Product } = require('../models');

const createMorningShift = async (req, res) => {
    try {
        let { totalNbBf } = req.body;
        const staffId = req.id;
        const existingOpenShift = await Shift.findOne({ where: { isOpen: true } });

        if (existingOpenShift) {
            return res.status(400).json({ message: 'There is a shift already opening' });
        }
        const breakFast = await Product.findOne({ where: { reference: 'BKF' } });
        if (!breakFast) {
            return res.status(400).json({ message: 'There no product added in databse' });
        }
        if (totalNbBf < 1 || !staffId) {
            return res.status(400).json({ message: 'Please verify your inputs' });
        }

        const totalAmountBf = totalNbBf * breakFast.price;

        const newShift = await Shift.create({ totalNbBf, totalAmountBf, staffId });
        return res.status(201).json({
            message: 'Shift open with success',
            shift: newShift.toJSON(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { createMorningShift };