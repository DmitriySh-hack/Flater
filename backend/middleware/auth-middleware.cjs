const ApiError = require('../exceptions/api-error.cjs');
const tokenService = require("../services/token-service.cjs");


module.exports = function(req, res, next){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return next(ApiError.UnathorizedError())
        }

        const accessTokern = authHeader.split(' ')[1];
        if(!accessTokern){
            return next(ApiError.UnathorizedError())
        }

        const userData = tokenService.validateAccssesToken(accessTokern);
        if(!userData){
            return next(ApiError.UnathorizedError())
        }

        req.user = userData;
        next();
    }catch(e){
        return next(ApiError.UnathorizedError());
    }
}