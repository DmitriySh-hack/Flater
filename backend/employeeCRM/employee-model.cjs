const { sql, query } = require('../db-mssql.cjs');

const EmployeeModel = {
    async findById(id) {
        const res = await query(`SELECT TOP 1 id, name, nickname, password, position from dbo.[employee] WHERE id = @id`, [
            { name: 'id', type: sql.NVarChar, value: id}
        ]);
        return res.recordset[0]
    },

    async findByNickname(nickname) {
        const res = await query(
            `SELECT TOP 1 id FROM dbo.[employee] WHERE nickname = @nickname`,
            [{ name: 'nickname', type: sql.NVarChar, value: nickname }]
        );
        return res.recordset[0] || null;
    },

    async createEmployee(userData){
        const { id, name, nickname, password, position } = userData;
        await query(
            `INSERT INTO dbo.[employee] (id, name, nickname, password, position)
            VALUES (@id, @name, @nickname, @password, @position)`,
            [
                {name: 'id', type: sql.NVarChar, value: id},
                {name: 'name', type: sql.NVarChar, value: name},
                {name: 'nickname', type: sql.NVarChar, value: nickname},
                {name: 'password', type: sql.NVarChar, value: password},
                {name: 'position', type: sql.NVarChar, value: position},
            ]
        );
        return await this.findById(id)
    },

    async UpdateDataById(){
        const setClauses = [];
        const params = [{name: 'id', type: sql.NVarChar, value: id}];
        if (update.name !== undefined) {setClauses.push('name = @name'); params.push({ name: 'name', type: sql.NVarChar, value: update.name})}
        if (update.nickname !== undefined) { setClauses.push('nickname = @nickname'); params.push({name: 'nickname', type: sql.NVarChar, value: update.nickname})}
        if (update.password !== undefined) {setClauses.push('password = @password'); params.push({ name: 'password', type: sql.NVarChar, value: update.password})}
        if (update.position !== undefined) {setClauses.push('position = @position'); params.push({ name: 'position', type: sql.NVarChar, value: update.position})}

        await query(`UPDATE dbo.[employee] SET ${setClauses.join(', ')} WHERE id = @id`, params);
        return await this.findById(id)
    },

    async loginEmployee(where){
        if(where.nickname) {
            const res = await query(
                `SELECT TOP 1 id, name, nickname, password, position FROM dbo.[employee] WHERE nickname = @nickname`,
                [{ name: 'nickname', type: sql.NVarChar, value: where.nickname }]
            );
            return res.recordset[0] || null;
        }
        return null;
    }
}

module.exports = EmployeeModel;