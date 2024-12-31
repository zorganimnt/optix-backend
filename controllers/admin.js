const { Admin, Doctor } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerAdmin = async (req, res) => {
    try {
        let { username, password, hotelId, perms } = req.body;
        const existingUser = await Admin.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'username already registered' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await Admin.create({ username, password: hashedPassword, hotelId, perms });
        return res.status(201).json({
            message: 'Admin registered successfully',
            user: newUser.toJSON(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Admin.findOne({ where: { username } });
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


module.exports = { registerAdmin, loginAdmin };