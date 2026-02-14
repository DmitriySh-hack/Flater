const CalendarModel = require('./calendar-model.cjs');
const AdvertisementModel = require('../advertisement/advertisment-model.cjs')
const CalendarDTO = require('./calendar-dto.cjs');
const ApiError = require('../exceptions/api-error.cjs');

class CalendarService {
    async getBookedDates(adId) {
        const res = await CalendarModel.getBookings(adId);
        return res.map(item => new CalendarDTO(item))
    }

    async reserve(userId, adId, startDate, endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            throw ApiError.BadRequest('Дата начала не может быть позже даты конца');
        }

        const res = await CalendarModel.checkOverlap(adId, startDate, endDate);
        if (res) {
            throw ApiError.BadRequest('Выбранные даты уже заняты')
        }

        const bookingData = {
            user_id: userId,
            advertisement_id: adId,
            start_date: startDate,
            end_date: endDate
        };
        return await CalendarModel.createBooking(bookingData);
    }

    async deleteBooking(userId, adId) {
        return await CalendarModel.deleteBookingByAdAndUser(adId, userId);
    }

    async getUserBookingEntries(userId){
        const rows = await CalendarModel.findByUserId(userId);
        const entries = await Promise.all(rows.map(
            async (row) => {
                const ad = await AdvertisementModel.findById(row.advertisement_id);
                if (!ad) return null;
                //Начало забронированной даты
                const startDate = row.start_date ? 
                (
                    row.start_date.toISOString ? 
                    row.start_date.toISOString().split('T')[0] : 
                    row.start_date
                ) : null;
                //Конец забронирорванной даты
                const endDate = row.end_date ?
                (
                    row.end_date.toISOString ? 
                    row.end_date.toISOString().split('T')[0] : 
                    row.end_date
                ) : null;

                return {
                    id: row.id,
                    advertisementId: row.advertisement_id,
                    startDate,
                    endDate,
                    advertisement: ad,
                }
            }
        ));
        return entries.filter(Boolean);
    }

    async deleteBookingById(id, userId) {
        return await CalendarModel.deleteById(id, userId);
    }
}

module.exports = new CalendarService()