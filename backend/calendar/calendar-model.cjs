const { queryRaw } = require('msnodesqlv8');
const { sql, query } = require('../db-mssql.cjs');
const { validate } = require('uuid');

class CalendarModel {
    async findById(id) {
        const res = await query(`SELECT * FROM booking_dates WHERE id = @id`,
            [{ name: 'id', type: sql.NVarChar(255), value: id }]
        );
        return res.recordset[0];
    }

    async getBookings(advertisementId) {
        const res = await query(`
            SELECT start_date, end_date FROM booking_dates 
            WHERE advertisement_id=@advertisement_id
            `,
            [{ name: 'advertisement_id', type: sql.NVarChar(255), value: advertisementId }]
        )
        return res.recordset || [];
    }

    async createBooking(calendar) {
        const { advertisement_id, user_id, start_date, end_date } = calendar
        const res = await query(`
            INSERT INTO booking_dates (advertisement_id, user_id, start_date, end_date)
            OUTPUT INSERTED.*
            VALUES (@advertisement_id, @user_id, @start_date, @end_date)
        `,
            [
                { name: 'advertisement_id', type: sql.NVarChar(255), value: advertisement_id },
                { name: 'user_id', type: sql.NVarChar(255), value: user_id },
                { name: 'start_date', type: sql.Date, value: start_date },
                { name: 'end_date', type: sql.Date, value: end_date }
            ]
        )
        return res.recordset[0]
    }

    async checkOverlap(adId, start, end) {
        const res = await query(`
            SELECT COUNT(*) as count from booking_dates
            WHERE advertisement_id = @adId AND (start_date < @end AND end_date > @start)
        `,
            [
                { name: 'adId', type: sql.NVarChar(255), value: adId },
                { name: 'end', type: sql.Date, value: end },
                { name: 'start', type: sql.Date, value: start }
            ]
        )
        return res.recordset[0].count > 0
    }

    async deleteBookingByAdAndUser(advertisementId, userId) {
        const res = await query(`
            DELETE FROM booking_dates 
            WHERE advertisement_id = @advertisement_id AND user_id = @user_id
        `, [
            { name: 'advertisement_id', type: sql.NVarChar(255), value: advertisementId },
            { name: 'user_id', type: sql.NVarChar(255), value: userId }
        ]);
        return res.rowsAffected[0];
    }

    async findByUserId(userId){
        const res = await query(`
            SELECT * FROM booking_dates
            WHERE user_id = @user_id
            ORDER BY start_date ASC
        `,[
            {name: 'user_id', type: sql.NVarChar(255), value: userId }
        ]);
        return res.recordset || [];
    }

    async deleteById(id, userId){
        const res = await query(`
            DELETE FROM booking_dates
            WHERE id = @id AND user_id = @user_id
        `,[
            { name: 'id', type: sql.Int, value: id },
            { name: 'user_id', type: sql.NVarChar(255), value: userId }
        ]);
        return res.rowsAffected[0];
    }
}

module.exports = new CalendarModel()