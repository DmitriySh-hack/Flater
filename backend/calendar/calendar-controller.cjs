const CalendarService = require('./calendar-service.cjs')

class CalendarController {
    async getBooking(req, res, next) {
        try {
            const advertisementId = req.params.adId;
            const result = await CalendarService.getBookedDates(advertisementId)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async createdBooking(req, res, next) {
        try {
            const { advertisementId, startDate, endDate } = req.body
            const userId = req.user?.id || req.user?.userId || req.user?._id;

            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const result = await CalendarService.reserve(userId, advertisementId, startDate, endDate)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async deleteBooking(req, res, next) {
        try {
            const advertisementId = req.params.adId;
            const userId = req.user?.id || req.user?.userId || req.user?._id;

            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            console.log('🗑️ Delete request for ad:', advertisementId, 'by user:', userId);
            const deletedCount = await CalendarService.deleteBooking(userId, advertisementId);
            console.log('✅ Deleted rows:', deletedCount);

            return res.json({
                message: 'Запрос на удаление обработан',
                deletedCount: deletedCount
            });
        } catch (e) {
            console.error('❌ Delete error:', e);
            next(e)
        }
    }

    async getBookingEntries(req, res, next) {
        try {
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            if (!userId) return res.status(401).json({ error: 'Пользователь не авторизован' });

            const result = await CalendarService.getUserBookingEntries(userId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async deleteBookingEntries(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const userId = req.user?.id || req.user?.userId || req.user?._id;

            if (!userId) return res.status(401).json({ error: 'Пользователь не авторизован' });
            if (isNaN(id)) return res.status(400).json({ error: 'Некорректный id' });

            const deleted = await CalendarService.deleteBookingById(id, userId);
            return res.json({ message: 'Удалено', deletedCount: deleted });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CalendarController()