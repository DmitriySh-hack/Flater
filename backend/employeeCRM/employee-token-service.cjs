const jwt = require('jsonwebtoken');
const employeeTokenModel = require('./employee-token-model.cjs');

class EmployeeTokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        };
    }

    validateAccssesToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (e) {
            return null;
        }
    }

    async saveToken(employeeId, refreshToken) {
        const existing = await employeeTokenModel.findOne({ employeeId });
        if (existing) {
            return await employeeTokenModel.updateOne({ employeeId }, { refreshToken });
        }
        return await employeeTokenModel.create({ employeeId, refreshToken });
    }

    async removeToken(refreshToken) {
        return await employeeTokenModel.deleteOne({ refreshToken });
    }

    async findToken(refreshToken) {
        return await employeeTokenModel.findOne({ refreshToken });
    }
}

module.exports = new EmployeeTokenService();
