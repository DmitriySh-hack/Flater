const MessageService = require('./message-service.cjs');

class MessageController {
    async getHistory(req, res, next) {
        try {
            const myId = req.user.id;
            const otherId = req.params.userId;
            const advertisementId = req.query.adId;

            const messages = await MessageService.getHistory(myId, otherId, advertisementId);
            return res.json(messages);
        } catch (e) {
            next(e);
        }
    }

    async getDialogs(req, res, next) {
        try {
            const myId = req.user.id;
            const dialogs = await MessageService.getDialogs(myId);
            return res.json(dialogs);
        } catch (e) {
            next(e);
        }
    }

    async deleteDialog(req, res, next) {
        try {
            const myId = req.user.id;
            const otherId = req.params.userId;
            const advertisementId = req.query.adId;

            await MessageService.deleteDialog(myId, otherId, advertisementId);
            return res.json({ success: true });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new MessageController()