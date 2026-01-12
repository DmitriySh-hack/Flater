const ws = require('ws')
const jwt = require('jsonwebtoken');
const MessageService = require('./message-service.cjs');

function startWebSocket(server) {
    const wss = new ws.Server({ server })

    const clients = new Map();

    wss.on('connection', async (connection, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const token = url.searchParams.get('token')

        if (!token) {
            connection.close()
            console.log('Токена нет!')
            return;
        }

        let userId = null;

        try {
            const userData = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            userId = userData.id;
        } catch (e) {
            connection.close();
            console.log('Невалидный токен');
            return;
        }

        clients.set(userId, connection);
        console.log(`User ${userId} connected`)

        connection.on('message', async (messageStr) => {
            try {
                const message = JSON.parse(messageStr)

                if (message.event === 'message') {
                    const { recipientId, content, advertisementId } = message;

                    await MessageService.saveMessage(userId, recipientId, content, advertisementId);

                    const recipientWs = clients.get(recipientId)
                    if (recipientWs && recipientWs.readyState === ws.OPEN) {
                        recipientWs.send(JSON.stringify({
                            event: 'message',
                            senderId: userId,
                            content: content,
                            advertisementId: advertisementId,
                            createAt: new Date().toISOString()
                        }))
                    }
                }
            } catch (e) {
                console.error(e)
            }
        })

        connection.on('close', () => {
            clients.delete(userId)
        });
    });


}

module.exports = startWebSocket;