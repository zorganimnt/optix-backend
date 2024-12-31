exports.checkStaffMorning = (req, res, next) => {
    const shift = req.user.shift;
    if ((shift && shift.split('|').includes('morning'))) {
        return next();
    } else {
        return res.status(403).json({
            message: "Permission denied: You do not have Morning shift permissions"
        });
    }
};