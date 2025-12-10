const { sql, query } = require('../db-mssql.cjs');

const AdvertismentModel = {
    async findById(id){
        const res = await query(`SELECT * FROM advertisements WHERE id = @id`,
            [{name: 'id', type: sql.NVarChar, value: id}]
        );
        if (res.recordset[0]) {
            const ad = res.recordset[0];
            if (ad.images && typeof ad.images === 'string') {
                try {
                    ad.images = JSON.parse(ad.images);
                } catch (e) {
                    ad.images = [];
                }
            } else {
                ad.images = ad.images || [];
            }
            return ad;
        }
        return null;
    },
    
    async create(advert){
        const { id, title, price, city, street, countOfRooms, images, userId } = advert

        const imagesJson = images ? JSON.stringify(images) : JSON.stringify([]);

        await query(`INSERT INTO advertisements (id, title, price, city, street, countOfRooms, images, user_id) 
            VALUES (@id, @title, @price, @city, @street, @countOfRooms, @images, @userId )`,
            [
                { name: 'id', type: sql.NVarChar, value: id },
                { name: 'userId', type: sql.NVarChar, value: userId },
                { name: 'title', type: sql.NVarChar, value: title },
                { name: 'city', type: sql.NVarChar, value: city },
                { name: 'street', type: sql.NVarChar, value: street },
                { name: 'countOfRooms', type: sql.Int, value: countOfRooms },
                { name: 'price', type: sql.Decimal(18,2), value: price },
                { name: 'images', type: sql.NVarChar, value: imagesJson },
            ]);
            return await this.findById(id);
    },

    async countByUserId(userId){
        const res = await query(`SELECT COUNT(*) FROM advertisements WHERE user_id = @userId`,
            [{ name: 'userId', type: sql.NVarChar, value: userId }]
        )
        return res.recordset[0].count
    },

    async findByUserId(userId){
        const res = await query(`SELECT * FROM advertisements WHERE user_id = @userId`,
            [{ name: 'userId', type: sql.NVarChar, value: userId }]
        )
        return res.recordset.map(ad => {
            if (ad.images && typeof ad.images === 'string') {
                try {
                    ad.images = JSON.parse(ad.images);
                } catch (e) {
                    ad.images = [];
                }
            } else {
                ad.images = ad.images || [];
            }
            return ad;
        });
    },
    
    async findByIdAndUpdate(id, update){
        const setClauses = [];
        const params = [{ name: 'id', type: sql.NVarChar, value: id }];
        if (update.title !== undefined) { setClauses.push('title = @title'); params.push({ name: 'title', type: sql.NVarChar, value: update.title }); }
        if (update.price !== undefined)  { setClauses.push('price = @price');   params.push({ name: 'price',  type: sql.Int, value: update.price }); }
        if (update.city !== undefined)     { setClauses.push('city = @city');        params.push({ name: 'city',     type: sql.NVarChar, value: update.city }); }
        if (update.street !== undefined)  { setClauses.push('street = @street');  params.push({ name: 'street',  type: sql.NVarChar, value: update.street }); }
        if (update.countOfRooms !== undefined) { setClauses.push('countOfRooms = @countOfRooms'); params.push({ name: 'countOfRooms', type: sql.Int, value: update.countOfRooms }); }
        if (update.userId !== undefined) { setClauses.push('userId = @userId'); params.push({ name: 'userId', type: sql.NVarChar, value: update.userId }); }
        if(update.images !== undefined){ setClauses.push('images = @images'); params.push({ name: 'images', type: sql.JSON.stringify(images), value: update.images }); }
        if (setClauses.length === 0) {
            return await this.findById(id);
        }
        await query(`UPDATE advertisements SET ${setClauses.join(', ')} WHERE id = @id`, params);
        return await this.findById(id);
    },

    async deleteById(id){
        const res = await query(`DELETE FROM advertisements WHERE id = @id`,
            [{name: 'id', type: sql.NVarChar, value: id}]
        )
        return { deleteCount: res.rowsAffected[0] || 0}
    },

    async findAll(){
        const res = await query(`SELECT * FROM advertisements`)
        return res.recordset.map(ad => {
            if (ad.images && typeof ad.images === 'string') {
                try {
                    ad.images = JSON.parse(ad.images);
                } catch (e) {
                    ad.images = [];
                }
            } else {
                ad.images = ad.images || [];
            }
            return ad;
        });
    }
}

module.exports = AdvertismentModel;