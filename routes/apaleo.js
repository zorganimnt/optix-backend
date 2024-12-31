// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const apaleoController = require("../controllers/apaleo")

router.get('/app/user', apaleoController.getUser);
router.get('/app/user/allUsers', apaleoController.getAllUsers);
router.get('/app/user/services', apaleoController.getService);
router.get('/app/user/includedService', apaleoController.getIncluded);
router.put('/app/user/charges', apaleoController.makeCharges);
router.get('/app/user/info', apaleoController.getBfInfo);
router.get('/app/user/total', apaleoController.getTotalBf);

module.exports = router;
