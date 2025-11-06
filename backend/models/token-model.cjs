const { sql, query } = require('../db-mssql.cjs');

const TokenModel = {

    //Поиск токена либо по refreshToken, либо по userId
    async findOne(where) {
        if (where.userId) {
            const res = await query('SELECT TOP 1 * FROM dbo.[tokens] WHERE userId = @userId', [
                { name: 'userId', type: sql.NVarChar, value: where.userId }
            ]);
            return res.recordset[0] || null;
        } else if (where.refreshToken) {
            const res = await query('SELECT TOP 1 * FROM dbo.[tokens] WHERE refreshToken = @refreshToken', [
                { name: 'refreshToken', type: sql.NVarChar, value: where.refreshToken }
            ]);
            return res.recordset[0] || null;
        }
        return null;
    },
    
    //Создание токена в БД
    async create(tokenData) {
        const { userId, refreshToken } = tokenData;
        await query('INSERT INTO dbo.[tokens] (userId, refreshToken) VALUES (@userId, @refreshToken)', [
            { name: 'userId', type: sql.NVarChar, value: userId },
            { name: 'refreshToken', type: sql.NVarChar, value: refreshToken }
        ]);
        return { userId, refreshToken };
    },
    
    //Обновление существующего токена
    async updateOne(where, update) {
        if (where.userId) {
            const res = await query('UPDATE dbo.[tokens] SET refreshToken = @refreshToken WHERE userId = @userId', [
                { name: 'refreshToken', type: sql.NVarChar, value: update.refreshToken },
                { name: 'userId', type: sql.NVarChar, value: where.userId }
            ]);
            if (res.rowsAffected[0] === 0) return null;
            return await this.findOne({ userId: where.userId });
        } else if (where.refreshToken) {
            const res = await query('UPDATE dbo.[tokens] SET refreshToken = @newToken WHERE refreshToken = @oldToken', [
                { name: 'newToken', type: sql.NVarChar, value: update.refreshToken },
                { name: 'oldToken', type: sql.NVarChar, value: where.refreshToken }
            ]);
            if (res.rowsAffected[0] === 0) return null;
            return await this.findOne({ refreshToken: update.refreshToken });
        }
        return null;
    },
    
    //Удаление токена
    async deleteOne(where) {
        const res = await query('DELETE FROM dbo.[tokens] WHERE refreshToken = @refreshToken', [
            { name: 'refreshToken', type: sql.NVarChar, value: where.refreshToken }
        ]);
        return { deletedCount: res.rowsAffected[0] || 0 };
    }
};

module.exports = TokenModel;