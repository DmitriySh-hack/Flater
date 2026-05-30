const PaySystemModel = require('./paySystem-model.cjs');
const CalendarModel = require('../calendar/calendar-model.cjs');
const AdvertisementModel = require('../advertisement/advertisment-model.cjs');
const ApiError = require('../exceptions/api-error.cjs');

function toDateString(date) {
    if (!date) return null;
    if (date.toISOString) return date.toISOString().split('T')[0];
    return String(date).split('T')[0];
}

function nightsBetween(start, end) {
    const a = new Date(toDateString(start));
    const b = new Date(toDateString(end));
    const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}

class PaySystemService {
    async createOrderFromBooking(userId, bookingRow, advertisement) {
        if (!bookingRow || !advertisement) {
            throw ApiError.BadRequest('Нет данных бронирования или объявления');
        }

        const bookingUserId = bookingRow.user_id;
        if (bookingUserId !== userId) {
            throw ApiError.BadRequest('Бронирование принадлежит другому пользователю');
        }

        const adId = bookingRow.advertisement_id;
        if (advertisement.id !== adId) {
            throw ApiError.BadRequest('Объявление не совпадает с бронированием');
        }

        const nights = nightsBetween(bookingRow.start_date, bookingRow.end_date);
        if (nights <= 0) {
            throw ApiError.BadRequest('Некорректный период бронирования');
        }

        const pricePerDay = Number(advertisement.price) || 0;
        const totalPrice = pricePerDay * nights;

        const order = await PaySystemModel.createOrder({
            booking_id: bookingRow.id,
            client_id: userId,
            seller_id: advertisement.user_id,
            advertisement_id: adId,
            price: totalPrice,
        });

        return {
            success: true,
            message: 'Заказ создан',
            data: order,
        };
    }

    async createOrderByBookingId(userId, bookingId) {
        const existingOrder = await PaySystemModel.findByBookingId(bookingId);
        if (existingOrder) {
            throw ApiError.BadRequest('Заказ по этому бронированию уже оформлен');
        }

        const bookingRow = await CalendarModel.findById(bookingId);
        if (!bookingRow) {
            throw ApiError.BadRequest('Бронирование не найдено');
        }

        const advertisement = await AdvertisementModel.findById(bookingRow.advertisement_id);
        if (!advertisement) {
            throw ApiError.BadRequest('Объявление не найдено');
        }

        return this.createOrderFromBooking(userId, bookingRow, advertisement);
    }

    async getOrdersForExport() {
        return PaySystemModel.findAll();
    }

    async getAllOrders() {
        return PaySystemModel.findAll();
    }

    async getMyOrders(userId) {
        const orders = await PaySystemModel.findByClientId(userId);
        return orders || [];
    }

    async confirmMoveIn(orderId, userId) {
        const updated = await PaySystemModel.confirmMoveIn(orderId, userId);
        if (!updated) {
            throw ApiError.BadRequest('Заказ не найден или заселение уже подтверждено');
        }
        return {
            success: true,
            message: 'Заселение подтверждено',
        };
    }

    /** Скрыть заказ только в профиле покупателя (в CRM и БД остаётся) */
    async hideFromProfile(orderId, userId) {
        const updated = await PaySystemModel.hideFromProfile(orderId, userId);
        if (!updated) {
            throw ApiError.BadRequest('Заказ не найден');
        }
        return {
            success: true,
            message: 'Заказ убран из списка в профиле',
        };
    }
}

module.exports = new PaySystemService();
