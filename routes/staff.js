// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const staffController = require("../controllers/staff")
const shiftController = require("../controllers/shift")

const checkAuth = require("../middlewares/checkAuth")
const checkPerms = require("../middlewares/checkPerms")
const checkShif = require("../middlewares/checkShift")

// AUTHENTICATION
router.post('/login', staffController.loginStaff);


// SHIFTS
router.post('/shift/morning', checkAuth.checkAuthStaff, checkPerms.checkShiftManage, checkShif.checkStaffMorning, shiftController.createMorningShift);
router.put('/shift', staffController.loginStaff);

module.exports = router;
