const PaySystemService = require('./paySystem-service.cjs');
const { exportOrdersToExcel } = require('./paySystem.cjs');

function getUserId(req) {
    return req.user?.id || req.user?.userId || req.user?._id;
}

class PaySystemController {
    async createOrder(req, res, next) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const { bookingId } = req.body;
            if (!bookingId) {
                return res.status(400).json({ error: 'bookingId обязателен' });
            }

            const result = await PaySystemService.createOrderByBookingId(userId, Number(bookingId));
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async getMyOrders(req, res, next) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const orders = await PaySystemService.getMyOrders(userId);
            return res.json(orders);
        } catch (e) {
            next(e);
        }
    }

    async confirmMoveIn(req, res, next) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID заказа обязателен' });
            }

            const result = await PaySystemService.confirmMoveIn(id, userId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async hideFromProfile(req, res, next) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID заказа обязателен' });
            }

            const result = await PaySystemService.hideFromProfile(id, userId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const orders = await PaySystemService.getAllOrders();
            return res.json(orders);
        } catch (e) {
            next(e);
        }
    }

    async exportExcel(req, res, next) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Пользователь не авторизован' });
            }

            const rows = await PaySystemService.getOrdersForExport();
            const buffer = await exportOrdersToExcel(rows);

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
            return res.send(buffer);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new PaySystemController();
