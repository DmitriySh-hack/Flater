const BookingAdvertisementModel = require('./booking-model.cjs');
const BookingAdvertisementService = require('./booking-service.cjs');

class BookingAdvertisementController {
    async bookingAdvertisement(req, res, next) {
        try {
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            const { advertisementId } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            if (!advertisementId) {
                return res.status(400).json({ error: 'ID объявления обязательно' });
            }

            const result = await BookingAdvertisementService.addAdvertisement(userId, advertisementId);
            return res.json(result);
        } catch(e) {
            next(e);
        }
    }

    async deleteBookingAdvertisemnt(req, res, next) {
        try {
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            const { advertisementId } = req.params;

            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            if (!advertisementId) {
                return res.status(400).json({ error: 'ID объявления обязательно' });
            }

            const result = await BookingAdvertisementService.deleteAdvertisement(userId, advertisementId);
            return res.json(result);
        } catch(e) {
            next(e);
        }
    }

    async getBooking(req, res, next) {
        try {
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const advertisements = await BookingAdvertisementService.getBookingAdvertisementUser(userId);
            
            return res.json(advertisements);
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new BookingAdvertisementController();