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
            `SELECT 
                u.id, 
                u.firstName, 
                u.lastName, 
                u.email, 
                u.avatarUrl,
                m.advertisementId,
                MAX(a.title) as advertisementTitle,
                SUM(CASE WHEN m.recipientId = @userId AND m.senderId = u.id AND m.isRead = 0 THEN 1 ELSE 0 END) as unreadCount
             FROM users u
             JOIN messages m ON (m.senderId = u.id AND m.recipientId = @userId) 
                             OR (m.recipientId = u.id AND m.senderId = @userId)
             LEFT JOIN advertisements a ON m.advertisementId = a.id
             WHERE m.senderId = @userId OR m.recipientId = @userId
             GROUP BY u.id, u.firstName, u.lastName, u.email, u.avatarUrl, m.advertisementId`,
            [
                { name: 'userId', type: sql.NVarChar, value: userId }
            ]
        )
        return res.recordset
    }

    async deleteDialog(user1Id, user2Id, advertisementId) {
        let sqlQuery = `DELETE FROM messages 
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

        await query(sqlQuery, params);
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

    async markReaded(messageId, userId) {
        await query(
            `UPDATE messages SET isRead = 1
            WHERE id = @messageId
                AND recipientId = @userId 
                AND isRead = 0`,
            [
                { name: 'messageId', type: sql.Int, value: messageId },
                { name: 'userId', type: sql.NVarChar, value: userId }
            ]
        )
    }

    async countRead(userId) {
        const res = await query(
            `SELECT COUNT(*) as count 
             FROM messages 
             WHERE recipientId = @userId AND isRead = 0`,
            [
                { name: 'userId', type: sql.NVarChar, value: userId }
            ]
        );
        return res.recordset[0].count;
    }
}

module.exports = new MessageModal()