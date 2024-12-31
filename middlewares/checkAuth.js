const { Admin, Staff } = require("../models");
const jwt = require("jsonwebtoken");

exports.checkAuthAdmin = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1];

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await Admin.findOne({ where: { id: decodedToken.id } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            req.user = user;
            next();

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token has expired" });
            } else if (error.name === "JsonWebTokenError") {
                return res.status(400).json({ message: "Invalid token provided" });
            } else {
                console.error("Error during token verification:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }
    } else {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }
};



exports.checkAuthStaff = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1];

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await Staff.findOne({ where: { id: decodedToken.id } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            req.user = user;
            next();

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token has expired" });
            } else if (error.name === "JsonWebTokenError") {
                return res.status(400).json({ message: "Invalid token provided" });
            } else {
                console.error("Error during token verification:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }
    } else {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }
};
