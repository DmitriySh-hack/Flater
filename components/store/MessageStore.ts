import { makeAutoObservable } from "mobx";
import $api from "../http";

export interface IMessage {
    id?: number;
    senderId: string;
    recipientId: string;
    content: string;
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
                    this.addMessage({
                        senderId: msg.senderId,
                        recipientId: '',
                        content: msg.content,
                        createdAt: msg.createdAt
                    })
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
}

export default new MessageStore