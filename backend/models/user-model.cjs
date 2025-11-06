const { sql, query } = require('../db-mssql.cjs');

const UserModel = {

    //Поиск пользователя по Email для авторизации
    async findOne(where) {
        if (where.email) {
            const res = await query('SELECT TOP 1 id, email, password, firstName, lastName, activationLink, isActivated, avatarUrl FROM dbo.[users] WHERE email = @email', [
                { name: 'email', type: sql.NVarChar, value: where.email }
            ]);
            return res.recordset[0] || null;
        } else if (where.activationLink) {
            const res = await query('SELECT TOP 1 id, email, password, firstName, lastName, activationLink, isActivated, avatarUrl FROM dbo.[users] WHERE activationLink = @activationLink', [
                { name: 'activationLink', type: sql.NVarChar, value: where.activationLink }
            ]);
            return res.recordset[0] || null;
        }
        return null;
    },
    
    //Создание пользлвателя
    async create(userData) {
        const { id, email, password, firstName, lastName, activationLink, isActivated, avatarUrl } = userData;
        await query(
            `INSERT INTO dbo.[users] (id, email, password, firstName, lastName, activationLink, isActivated, avatarUrl)
             VALUES (@id, @email, @password, @firstName, @lastName, @activationLink, @isActivated, @avatarUrl)`,
            [
                { name: 'id', type: sql.NVarChar, value: id },
                { name: 'email', type: sql.NVarChar, value: email },
                { name: 'password', type: sql.NVarChar, value: password },
                { name: 'firstName', type: sql.NVarChar, value: firstName },
                { name: 'lastName', type: sql.NVarChar, value: lastName },
                { name: 'activationLink', type: sql.NVarChar, value: activationLink },
                { name: 'isActivated', type: sql.Bit, value: Boolean(isActivated) },
                { name: 'avatarUrl', type: sql.NVarChar, value: avatarUrl || null }
            ]
        );
        return await this.findById(id);
    },
    
    //Изменение данных о пользователе, ориентируясь на его id, который неизменный
    async findByIdAndUpdate(id, update) {
        const setClauses = [];
        const params = [{ name: 'id', type: sql.NVarChar, value: id }];
        if (update.firstName !== undefined) { setClauses.push('firstName = @firstName'); params.push({ name: 'firstName', type: sql.NVarChar, value: update.firstName }); }
        if (update.lastName !== undefined)  { setClauses.push('lastName = @lastName');   params.push({ name: 'lastName',  type: sql.NVarChar, value: update.lastName }); }
        if (update.email !== undefined)     { setClauses.push('email = @email');        params.push({ name: 'email',     type: sql.NVarChar, value: update.email }); }
        if (update.password !== undefined)  { setClauses.push('password = @password');  params.push({ name: 'password',  type: sql.NVarChar, value: update.password }); }
        if (update.isActivated !== undefined) { setClauses.push('isActivated = @isActivated'); params.push({ name: 'isActivated', type: sql.Bit, value: Boolean(update.isActivated) }); }
        if (update.avatarUrl !== undefined) { setClauses.push('avatarUrl = @avatarUrl'); params.push({ name: 'avatarUrl', type: sql.NVarChar, value: update.avatarUrl }); }
        if (setClauses.length === 0) {
            return await this.findById(id);
        }
        await query(`UPDATE dbo.[users] SET ${setClauses.join(', ')} WHERE id = @id`, params);
        return await this.findById(id);
    },

    //Поиск пользователя по id
    async findById(id) {
        const res = await query('SELECT TOP 1 id, email, password, firstName, lastName, activationLink, isActivated, avatarUrl FROM dbo.[users] WHERE id = @id', [
            { name: 'id', type: sql.NVarChar, value: id }
        ]);
        return res.recordset[0] || null;
    }
};

module.exports = UserModel;