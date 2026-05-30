const { sql, query } = require('../db-mssql.cjs');

const PaySystemModel = {
    async createOrder(orderData) {
        const id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    
        const res = await query(`
            INSERT INTO orders (id, booking_id, client_id, seller_id, advertisement_id, price)
            OUTPUT INSERTED.*
            VALUES (@id, @booking_id, @client_id, @seller_id, @advertisement_id, @price)
        `, [
            { name: 'id', type: sql.NVarChar, value: id },
            { name: 'booking_id', type: sql.Int, value: orderData.booking_id },
            { name: 'client_id', type: sql.NVarChar, value: orderData.client_id },
            { name: 'seller_id', type: sql.NVarChar, value: orderData.seller_id },
            { name: 'advertisement_id', type: sql.NVarChar, value: orderData.advertisement_id },
            { name: 'price', type: sql.Decimal(18, 2), value: orderData.price },
        ]);
    
        return res.recordset[0];
    },

    async findAll(){
        const res = await query(`
            SELECT
                id,
                booking_id,
                client_id,
                seller_id,
                advertisement_id,
                price,
                move_in_confirmed,
                confirmed_at,
                created_at
            FROM orders
            ORDER BY created_at DESC
        `);
        return res.recordset || [];
    },

    async findBookingIdsByClientId(clientId) {
        const res = await query(`
            SELECT booking_id FROM orders
            WHERE client_id = @client_id
        `, [{ name: 'client_id', type: sql.NVarChar, value: clientId }]);
        return (res.recordset || []).map((row) => row.booking_id);
    },

    async findByBookingId(bookingId) {
        const res = await query(`
            SELECT TOP 1 id FROM orders WHERE booking_id = @booking_id
        `, [{ name: 'booking_id', type: sql.Int, value: bookingId }]);
        return res.recordset[0] || null;
    },

    async findByClientId(clientId){
        const res = await query(`
            SELECT * FROM orders
            WHERE client_id = @client_id
            ORDER BY created_at DESC
        `,[{name: 'client_id', type: sql.NVarChar, value: clientId}])
        const rows = res.recordset || [];
        return rows.filter((row) => !row.hidden_from_profile);
    },

    async hideFromProfile(orderId, clientId) {
        try {
            const res = await query(`
                UPDATE orders
                SET hidden_from_profile = 1
                WHERE id = @id AND client_id = @client_id
            `, [
                { name: 'id', type: sql.NVarChar, value: orderId },
                { name: 'client_id', type: sql.NVarChar, value: clientId },
            ]);
            return res.rowsAffected[0] > 0;
        } catch (err) {
            const msg = String(err?.message || err);
            if (msg.includes('hidden_from_profile')) {
                const e = new Error(
                    'Выполните в SQL Server: ALTER TABLE orders ADD hidden_from_profile BIT NOT NULL DEFAULT 0;'
                );
                e.code = 'MISSING_COLUMN';
                throw e;
            }
            throw err;
        }
    },

    async confirmMoveIn(orderId, clientId){
        const res = await query(`
            UPDATE orders
            SET move_in_confirmed = 1, confirmed_at = GETDATE()
            WHERE id = @id AND client_id = @client_id AND move_in_confirmed = 0
        `,[
            {name: 'id', type: sql.NVarChar, value: orderId},
            {name: 'client_id', type: sql.NVarChar, value: clientId}
        ]);
        return res.rowsAffected[0] > 0;
    }
}

module.exports = PaySystemModel;