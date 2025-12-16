const BookingAdvertisementModel = require('./booking-model.cjs');
const BookingAdvertisementDTO = require('./booking-dtos.cjs');

// Нужно импортировать модель объявлений
// Если у вас есть файл advertisment-model.cjs в другой директории:
const path = require('path');
const AdvertisementModel = require(path.join(__dirname, '..', 'advertisement', 'advertisment-model.cjs'));

class BookingAdvertisementService {
    async addAdvertisement(userId, advertisementId) {
        // Проверяем, существует ли объявление
        const advertisement = await AdvertisementModel.findById(advertisementId);
        if (!advertisement) {
            throw new Error('Объявление не найдено');
        }

        // Проверяем, не забронировано ли уже
        const existing = await BookingAdvertisementModel.findByUserAndAdvertisement(userId, advertisementId);
        if (existing) {
            throw new Error('Объявление уже забронировано');
        }

        const booking = await BookingAdvertisementModel.add(userId, advertisementId);
        return {
            success: true,
            message: 'Объявление добавлено в список бронируемых',
            data: new BookingAdvertisementDTO(booking)
        };
    }

    async deleteAdvertisement(userId, advertisementId) {
        const booking = await BookingAdvertisementModel.findByUserAndAdvertisement(userId, advertisementId);
        
        if (!booking) {
            throw new Error('Бронирование не найдено');
        }

        const result = await BookingAdvertisementModel.deleteById(booking.id);
        return {
            success: true,
            message: 'Объявление удалено из списка бронируемых',
            deletedCount: result.deletedCount
        };
    }

    async getBookingAdvertisementUser(userId) {
        // Получаем записи о бронировании
        const bookings = await BookingAdvertisementModel.findByUserId(userId);
        
        if (!bookings || bookings.length === 0) {
            return [];
        }

        // Получаем полные данные объявлений
        const advertisementPromises = bookings.map(async (booking) => {
            try {
                const advertisement = await AdvertisementModel.findById(booking.advertisement_id);
                if (advertisement) {
                    return {
                        ...advertisement,
                        bookingId: booking.id,
                        bookingCreatedAt: booking.create_at
                    };
                }
                return null;
            } catch (error) {
                console.error('Ошибка при получении объявления:', error);
                return null;
            }
        });
        
        const advertisements = await Promise.all(advertisementPromises);
        
        // Фильтруем null значения и возвращаем только валидные объявления
        return advertisements.filter(ad => ad !== null);
    }
}

module.exports = new BookingAdvertisementService();