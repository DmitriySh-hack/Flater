const MessageDTO = require('./message-dto.cjs')
const MessageModal = require('./message-modal.cjs')
const ApiError = require('../exceptions/api-error.cjs');

class MessageService {
    async getHistory(user1Id, user2Id, advertisementId) {
        const messages = await MessageModal.getMessages(user1Id, user2Id, advertisementId);
        return messages.map(msg => new MessageDTO(msg));
    }

    async getDialogs(userId) {
        return await MessageModal.getDialogs(userId);
    }

    async saveMessage(senderId, recipientId, content, advertisementId) {
        return await MessageModal.saveMessage(senderId, recipientId, content, advertisementId);
    }
}

module.exports = new MessageService()