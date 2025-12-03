const crypto = require('crypto')
const { sql, query } = require('../db-mssql.cjs');

const FavoriteAdvetisementModel = { 
    async add(userId, advertisementId){
        const id = crypto.randomUUID();

        const res = await query(`INSERT INTO favorite_advertisements (id, user_id, advertisement_id, created_at)
            VALUES (@id, @user_id, @advertisement_id, GETDATE())`,
            [
                {name: 'id', type: sql.NVarChar, value: id},
                {name: 'user_id', type: sql.NVarChar, value: userId},
                {name: 'advertisement_id', type: sql.NVarChar, value: advertisementId}
            ]
        )

        return { id, userId, advertisementId }
    },

    async findById(id){
        const res = await query(`SELECT * FROM favorite_advertisements WHERE id = @id`,
            [{name: 'id', type: sql.NVarChar, value:id}]
        );
        return res.recordset[0] || null;
    },

    async findByUserId(userId){
        const res = await query(`SELECT * FROM favorite_advertisements WHERE user_id = @user_id`,
            [{name: 'user_id', type: sql.NVarChar, value: userId}]
        )
        return res.recordset || [];
    },

    async deleteById(id){
        const res = await query(`DELETE FROM favorite_advertisements WHERE id = @id`,
            [{name: 'id', type: sql.NVarChar, value: id}]
        )
        return { deleteCount: res.rowsAffected[0] || 0}
    },

    async findByUserAndAdvertisement(userId, advertisementId) {
        const res = await query(`
            SELECT * FROM favorite_advertisements 
            WHERE user_id = @user_id AND advertisement_id = @advertisement_id`,
        [
            { name: 'user_id', type: sql.NVarChar, value: userId },
            { name: 'advertisement_id', type: sql.NVarChar, value: advertisementId }
        ]);
        return res.recordset[0] || null;
    }
}

module.exports = FavoriteAdvetisementModel;