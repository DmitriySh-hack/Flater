const { sql, query } = require('../db-mssql.cjs');

class MessageModal {
    async getMessages(user1Id, user2Id, advertisementId) {
        let sqlQuery = `SELECT * FROM messages 
             WHERE ((senderId = @user1Id AND recipientId = @user2Id) 
                OR (senderId = @user2Id AND recipientId = @user1Id))`;

        const params = [
            { name: 'user1Id', type: sql.NVarChar, value: user1Id },
            { name: 'user2Id', type: sql.NVarChar, value: user2Id }
        ];

        if (advertisementId) {
            sqlQuery += ` AND advertisementId = @advertisementId`;
            params.push({ name: 'advertisementId', type: sql.NVarChar, value: advertisementId });
        }

        sqlQuery += ` ORDER BY createdAt ASC`;
        const res = await query(sqlQuery, params);
        return res.recordset
    }

    async getDialogs(userId) {
        const res = await query(
            `SELECT DISTINCT 
                u.id, 
                u.firstName, 
                u.lastName, 
                u.email, 
                u.avatarUrl,
                m.advertisementId,
                a.title as advertisementTitle
             FROM users u
             JOIN messages m ON (m.senderId = u.id AND m.recipientId = @userId) 
                             OR (m.recipientId = u.id AND m.senderId = @userId)
             LEFT JOIN advertisements a ON m.advertisementId = a.id
             WHERE m.senderId = @userId OR m.recipientId = @userId
             GROUP BY u.id, u.firstName, u.lastName, u.email, u.avatarUrl, m.advertisementId, a.title`,
            [
                { name: 'userId', type: sql.NVarChar, value: userId }
            ]
        )
        return res.recordset
    }

    async saveMessage(senderId, recipientId, content, advertisementId) {
        await query(
            `INSERT INTO messages (senderId, recipientId, content, advertisementId) 
             VALUES (@senderId, @recipientId, @content, @advertisementId)`,
            [
                { name: 'senderId', type: sql.NVarChar, value: senderId },
                { name: 'recipientId', type: sql.NVarChar, value: recipientId },
                { name: 'content', type: sql.NVarChar, value: content },
                { name: 'advertisementId', type: sql.NVarChar, value: advertisementId || null }
            ]
        );
    }
}

module.exports = new MessageModal()