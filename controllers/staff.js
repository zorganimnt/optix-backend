const { Staff } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerStaff = async (req, res) => {
    try {
        let { username, password, hotelId, perms, shift } = req.body;
        const existingUser = await Staff.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'username already registered' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await Staff.create({ username, password: hashedPassword, hotelId, perms, shift });
        return res.status(201).json({
            message: 'Staff registered successfully',
            user: newUser.toJSON(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const loginStaff = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Staff.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const payload = {
            id: user.id,
            perms: user.perms,
            iat: Math.floor(Date.now() / 1000),
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '30d' });
        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: user.toJSON(), // Excludes password and sensitive fields
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { registerStaff, loginStaff };