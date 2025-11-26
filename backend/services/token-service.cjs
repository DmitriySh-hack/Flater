const { sign } = require('crypto');
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model.cjs');
const { ref } = require('process');

class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccssesToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData;
        }catch(e){
            return null;
        }
    }

    validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData;
        }catch(e){
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        const existing = await tokenModel.findOne({userId});
        if(existing){
            const updated = await tokenModel.updateOne({userId}, { refreshToken });
            return updated;
        }
        const token = await tokenModel.create({ userId, refreshToken });
        return token;
    }

    async removeToken(refreshToken){
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }
    async findToken(refreshToken){
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();