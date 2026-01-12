module.exports = class MessageDTO{
    id;
    senderId;
    recipientId;
    content;
    isRead;
    createAt;
    constructor(model){
        this.id = model.id
        this.senderId = model.senderId
        this.recipientId = model.recipientId
        this.content = model.content
        this.isRead = model.isRead
        this.createAt = model.createAt
    }
}