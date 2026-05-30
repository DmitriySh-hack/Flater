const ApiError = require('../exceptions/api-error.cjs');

module.exports = function (req, res, next) {
    const user = req.user;
    if (!user || user.role !== 'employee' || user.position !== 'super-admin') {
        return next(ApiError.BadRequest('Доступ только для super-admin'));
    }
    next();
};
