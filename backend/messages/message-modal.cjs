const { sql, query } = require('../db-mssql.cjs');

class MessageModal {
    async getMessages(user1Id, user2Id) {
        const res = await query(
            `SELECT * FROM messages 
             WHERE (senderId = @user1Id AND recipientId = @user2Id) 
                OR (senderId = @user2Id AND recipientId = @user1Id) 
             ORDER BY createdAt ASC`,
            [
                { name: 'user1Id', type: sql.NVarChar, value: user1Id },
                { name: 'user2Id', type: sql.NVarChar, value: user2Id }
            ]
        )

        return res.recordset
    }

    async getDialogs(userId) {
        const res = await query(
            `SELECT DISTINCT u.id, u.firstName, u.lastName, u.email, u.avatarUrl 
             FROM users u
             JOIN messages m ON (m.senderId = u.id AND m.recipientId = @userId) 
                             OR (m.recipientId = u.id AND m.senderId = @userId)
             WHERE m.senderId = @userId OR m.recipientId = @userId`,
            [
                { name: 'userId', type: sql.NVarChar, value: userId }
            ]
        )
        return res.recordset
    }

    async saveMessage(senderId, recipientId, content) {
        await query(
            `INSERT INTO messages (senderId, recipientId, content) 
             VALUES (@senderId, @recipientId, @content)`,
            [
                { name: 'senderId', type: sql.NVarChar, value: senderId },
                { name: 'recipientId', type: sql.NVarChar, value: recipientId },
                { name: 'content', type: sql.NVarChar, value: content }
            ]
        );
    }
}

module.exports = new MessageModal()