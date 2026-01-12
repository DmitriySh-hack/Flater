const MessageDTO = require('./message-dto.cjs')
const MessageModal = require('./message-modal.cjs')
const ApiError = require('../exceptions/api-error.cjs');

class MessageService {
    async getHistory(user1Id, user2Id) {
        const messages = await MessageModal.getMessages(user1Id, user2Id);
        return messages.map(msg => new MessageDTO(msg));
    }

    async getDialogs(userId) {
        return await MessageModal.getDialogs(userId);
    }

    async saveMessage(senderId, recipientId, content) {
        return await MessageModal.saveMessage(senderId, recipientId, content);
    }
}

module.exports = new MessageService()