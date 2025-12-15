const BookingAdvertisementModel = require('./booking-model.cjs');
const BookingAdvertisementDTO = require('./booking-dtos.cjs')

class BookingAdvertisementService{
    async addAdvertisement(userId, advertisementId){
        const booking = await BookingAdvertisementModel.add(userId, advertisementId)
        return {
            success: true,
            massege: 'Объявление добаввлено в список бронируемых',
            data: new BookingAdvertisementDTO(booking)
        }
    }

    async deleteAdvertisement(userId, advertisementId){
        const booking = await BookingAdvertisementModel.findByUserAndAdvertisement(userId, advertisementId)
        const result = await BookingAdvertisementModel.deleteById(booking)
        return {
            success: true,
            message: 'Объявление удалено из списка бронируемых',
            deletedCount: result.deletedCount
        }
    }

    async getBookingAdvertisementUser(userId){
        const booking = await BookingAdvertisementModel.findByUserId(userId);
        return booking.map(book => new BookingAdvertisementDTO(book))
    }
}

module.exports = new BookingAdvertisementService();