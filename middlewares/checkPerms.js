

// MANAGE STAF PERMESSION
exports.checkStaffManage = (req, res, next) => {
    const perms = req.user.perms;
    if ((perms && perms.split('|').includes('staff.manage')) || perms == 'all') {
        return next();
    } else {
        return res.status(403).json({
            message: "Permission denied: You do not have permission to manage Staff"
        });
    }
};

// MANAGE PRODUCTS PERMESSION
exports.checkProductManage = (req, res, next) => {
    const perms = req.user.perms;
    if ((perms && perms.split('|').includes('product.manage')) || perms == 'all') {
        return next();
    } else {
        return res.status(403).json({
            message: "Permission denied: You do not have permission to manage Product"
        });
    }
};


// MANAGE SHIFTS BY STAFF PERMESSION
exports.checkShiftManage = (req, res, next) => {
    const perms = req.user.perms;
    if ((perms && perms.split('|').includes('staff.shift.manage')) || perms == 'all') {
        return next();
    } else {
        return res.status(403).json({
            message: "Permission denied: You do not have permission to manage Shift"
        });
    }
};
