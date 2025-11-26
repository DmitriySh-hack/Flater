const ApiError = require('../exceptions/api-error.cjs');
const tokenService = require("../services/token-service.cjs");


module.exports = function(req, res, next){
    try{
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth Header:', authHeader);
        if(!authHeader){
            console.log('❌ No auth header');
            return next(ApiError.UnathorizedError())
        }

        const accessToken = authHeader.split(' ')[1];
        console.log('🔐 Access Token:', accessToken);
        if(!accessToken){
            console.log('❌ No access token');
            return next(ApiError.UnathorizedError())
        }

        const userData = tokenService.validateAccssesToken(accessToken);
        console.log('👤 User Data:', userData);
        if(!userData){
            console.log('❌ Invalid token');
            return next(ApiError.UnathorizedError())
        }

        req.user = userData;
        next();
    }catch(e){
        console.log('❌ Auth middleware error:', e);
        return next(ApiError.UnathorizedError());
    }
}