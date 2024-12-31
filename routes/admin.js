// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin")
const staffController = require("../controllers/staff")
const productController = require("../controllers/product")

const checkAuth = require("../middlewares/checkAuth")
const checkPerms = require("../middlewares/checkPerms")

// AUTHENTICATION
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);

// STAF MANAGE
router.post('/staff', checkAuth.checkAuthAdmin, checkPerms.checkStaffManage, staffController.registerStaff);
router.delete('/staff', staffController.registerStaff);
router.put('/staff', staffController.registerStaff);
router.get('/staff', staffController.registerStaff);
router.get('/staff/:id', staffController.registerStaff);

// PRODUCT MANAGE
router.post('/product', checkAuth.checkAuthAdmin, checkPerms.checkProductManage, productController.createProduct);


module.exports = router;
