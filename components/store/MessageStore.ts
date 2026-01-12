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

        // Используем порт 5000, так как там же работает API
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

    sendMessage(senderId: string, recipientId: string, content: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                event: 'message',
                recipientId,
                content
            }))

            this.addMessage({
                senderId,
                recipientId,
                content,
                createdAt: new Date().toISOString()
            });
        } else {
            console.error('Socket not connected')
        }
    }

    async fetchHistory(userId: string) {
        try {
            // Используем настроенный $api для корректного baseURL и заголовков
            const response = await $api.get(`/message/${userId}`);
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
}

export default new MessageStore