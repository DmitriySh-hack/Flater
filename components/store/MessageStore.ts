import { makeAutoObservable, runInAction } from "mobx";
import $api from "../http";

export interface IMessage {
    id?: number;
    senderId: string;
    recipientId: string;
    content: string;
    isRead: boolean;
    createdAt?: string;
}

export interface IDialog {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    advertisementId?: string;
    advertisementTitle?: string;
    unreadCount: number
}

class MessageStore {
    socket: WebSocket | null = null;
    messages: IMessage[] = [];
    isConnected = false;
    dialogs: IDialog[] = [];

    constructor() {
        makeAutoObservable(this)
    }

    setMessage(messages: IMessage[]) {
        if (Array.isArray(messages)) {
            this.messages = messages;
        } else {
            console.error('API returned non-array messages:', messages);
            this.messages = [];
        }
    }

    addMessage(message: IMessage) {
        this.messages.push(message)
    }

    connect(token: string) {
        if (this.socket) {
            this.socket?.close()
        }

        this.socket = new WebSocket('ws://localhost:5000?token=' + token)
        this.socket.onopen = () => {
            console.log('WebSocket connected!')
            this.isConnected = true;
        }
        this.socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.event === 'message') {
                    runInAction(() => {
                        this.addMessage({
                            senderId: msg.senderId,
                            recipientId: '',
                            content: msg.content,
                            isRead: msg.isRead,
                            createdAt: msg.createdAt
                        });

                        // Обновляем счетчик непрочитанных в списке диалогов
                        const dialog = this.dialogs.find(d =>
                            d.id === msg.senderId &&
                            (d.advertisementId === msg.advertisementId || (!d.advertisementId && !msg.advertisementId))
                        );
                        if (dialog && !msg.isRead) {
                            dialog.unreadCount++;
                        }
                    });
                }
            } catch (e) {
                console.error("Error parsing WS message:", e);
            }
        }
        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected!', event.code, event.reason)
            this.isConnected = false;
        }
    }

    sendMessage(senderId: string, recipientId: string, content: string, advertisementId?: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const payload: {
                event: string;
                recipientId: string;
                content: string;
                advertisementId?: string;
            } = {
                event: 'message',
                recipientId,
                content
            };
            // Если есть ID объявления, отправляем его
            if (advertisementId) {
                payload.advertisementId = advertisementId;
            }
            this.socket.send(JSON.stringify(payload));

            // Локальное добавление (можно также добавить поля adId если нужно отображать)
            this.addMessage({
                senderId,
                recipientId,
                content,
                isRead: false,
                createdAt: new Date().toISOString()
            });
            setTimeout(() => this.fetchDialogs(), 500);
        } else {
            console.error('Socket not connected')
        }
    }

    async fetchHistory(userId: string, advertisementId?: string) {
        try {
            const url = advertisementId
                ? `/message/${userId}?adId=${advertisementId}`
                : `/message/${userId}`;
            const response = await $api.get(url);
            this.setMessage(response.data);
        } catch (e) {
            console.error('Failed to load history', e)
        }
    }

    setDialogs(dialogs: IDialog[]) {
        this.dialogs = dialogs;
    }

    async fetchDialogs() {
        try {
            const response = await $api.get('/dialogs');
            this.setDialogs(response.data);
        } catch (e) {
            console.error('Failed to load dialogs', e)
        }
    }

    async deleteDialog(dialogId: string, advertisementId?: string) {
        try {
            const url = advertisementId
                ? `/dialogs/${dialogId}?adId=${advertisementId}`
                : `/dialogs/${dialogId}`;

            await $api.delete(url)

            this.dialogs = this.dialogs.filter(d => {
                if (advertisementId) {
                    return !(d.id === dialogId && d.advertisementId === advertisementId);
                }
                return d.id !== dialogId;
            });

            this.messages = [];
        } catch (e) {
            console.error('Failed to delete dialog', e);
        }
    }

    async messageRead(messageId: string, userId?: string) {
        try {
            let targetUserId = userId;

            if (!targetUserId) {
                const message = this.messages.find(msg =>
                    msg.id?.toString() === messageId || msg.id === Number(messageId)
                );
                targetUserId = message?.senderId;
            }

            if (!targetUserId) {
                throw new Error('Не удалось определить userId для пометки сообщения');
            }

            const response = await $api.post(`/dialog/${targetUserId}/${messageId}`);

            runInAction(() => {
                const messageIndex = this.messages.findIndex(msg =>
                    msg.id?.toString() === messageId || msg.id === Number(messageId)
                );

                if (messageIndex !== -1) {
                    this.messages[messageIndex].isRead = true;
                    console.log(`Сообщение "${this.messages[messageIndex].content}", id: ${messageId}, status: прочитано`);

                    // Уменьшаем счетчик непрочитанных в диалоге
                    const msg = this.messages[messageIndex];
                    const dialog = this.dialogs.find(d => d.id === msg.senderId);
                    if (dialog && dialog.unreadCount > 0) {
                        dialog.unreadCount--;
                    }
                }
            });

            return response;
        } catch (e) {
            console.error('Failed to read the message', e);
            throw e;
        }
    }

    async markMessagesAsRead(messageIds: string[], userId: string) {
        try {
            // Пометка каждого сообщения по отдельности
            const results = await Promise.all(
                messageIds.map(messageId => this.messageRead(messageId, userId))
            );

            return results;
        } catch (e) {
            console.error('Failed to mark messages as read', e);
            throw e;
        }
    }

    async markAllFromUserAsRead(userId: string) {
        try {
            const unreadMessages = this.messages.filter(msg =>
                msg.senderId === userId && !msg.isRead && msg.id
            );

            if (unreadMessages.length === 0) {
                console.log('Нет непрочитанных сообщений');
                return { count: 0 };
            }

            console.log(`Помечаем ${unreadMessages.length} сообщений как прочитанные`);

            const messageIds = unreadMessages.map(msg => msg.id!.toString());
            const results = await this.markMessagesAsRead(messageIds, userId);

            return { count: results.length };
        } catch (e) {
            console.error('Failed to mark all messages as read', e);
            throw e;
        }
    }
}

export default new MessageStore