const { sql, query } = require('../db-mssql.cjs');

const EmployeeTokenModel = {
    async findOne(where) {
        if (where.employeeId) {
            const res = await query('SELECT TOP 1 * FROM dbo.[employee_tokens] WHERE employeeId = @employeeId', [
                { name: 'employeeId', type: sql.NVarChar, value: where.employeeId }
            ]);
            return res.recordset[0] || null;
        } else if (where.refreshToken) {
            const res = await query('SELECT TOP 1 * FROM dbo.[employee_tokens] WHERE refreshToken = @refreshToken', [
                { name: 'refreshToken', type: sql.NVarChar, value: where.refreshToken }
            ]);
            return res.recordset[0] || null;
        }
        return null;
    },

    async create(tokenData) {
        const { employeeId, refreshToken } = tokenData;
        await query('INSERT INTO dbo.[employee_tokens] (employeeId, refreshToken) VALUES (@employeeId, @refreshToken)', [
            { name: 'employeeId', type: sql.NVarChar, value: employeeId },
            { name: 'refreshToken', type: sql.NVarChar, value: refreshToken }
        ]);
        return { employeeId, refreshToken };
    },

    async updateOne(where, update) {
        if (where.employeeId) {
            const res = await query('UPDATE dbo.[employee_tokens] SET refreshToken = @refreshToken WHERE employeeId = @employeeId', [
                { name: 'refreshToken', type: sql.NVarChar, value: update.refreshToken },
                { name: 'employeeId', type: sql.NVarChar, value: where.employeeId }
            ]);
            if (res.rowsAffected[0] === 0) return null;
            return await this.findOne({ employeeId: where.employeeId });
        } else if (where.refreshToken) {
            const res = await query('UPDATE dbo.[employee_tokens] SET refreshToken = @newToken WHERE refreshToken = @oldToken', [
                { name: 'newToken', type: sql.NVarChar, value: update.refreshToken },
                { name: 'oldToken', type: sql.NVarChar, value: where.refreshToken }
            ]);
            if (res.rowsAffected[0] === 0) return null;
            return await this.findOne({ refreshToken: update.refreshToken });
        }
        return null;
    },

    async deleteOne(where) {
        const res = await query('DELETE FROM dbo.[employee_tokens] WHERE refreshToken = @refreshToken', [
            { name: 'refreshToken', type: sql.NVarChar, value: where.refreshToken }
        ]);
        return { deletedCount: res.rowsAffected[0] || 0 };
    }
};

module.exports = EmployeeTokenModel;
