import React, { useEffect, useState, useContext } from 'react'
import { observer } from "mobx-react-lite";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MessageStore from '../store/MessageStore';
import { Context } from '../../src/main';
import './Messages.css'

const Messages: React.FC = observer(() => {
    const { store } = useContext(Context);
    const { id: recipientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const senderId = store.user.id;
    const [inputValue, setInputValue] = useState('')

    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const adId = searchParams.get('adId');

    useEffect(() => {
        MessageStore.fetchDialogs();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token && recipientId) {
            MessageStore.connect(token);
            MessageStore.fetchHistory(recipientId, adId || undefined);
        }
    }, [recipientId, adId])

    // При загрузке компонента устанавливаем активный диалог из URL
    useEffect(() => {
        if (adId) {
            setActiveDialog(adId);
        }
    }, [adId]);

    const handleSend = () => {
        if (!inputValue.trim() || !recipientId) return;
        MessageStore.sendMessage(senderId, recipientId, inputValue, adId || undefined);
        setInputValue('')
    }

    const handleDialogClick = (advertisementId: string | undefined) => {
        setActiveDialog(advertisementId || null);
    };

    return (
        <div className='message-container' style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Левая панель: Список диалогов */}
            <div style={{ width: '300px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <h3 style={{ marginLeft: '15px', marginTop: '10px' }}>Сообщения</h3>
                {MessageStore.dialogs.length === 0 ? (
                    <p>У вас пока нет диалогов</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        {MessageStore.dialogs.map((user, index) => (
                            <div
                                key={`${user.id}-${user.advertisementId || index}`}
                                onClick={() => {
                                    navigate(`/message/${user.id}${user.advertisementId ? `?adId=${user.advertisementId}` : ''}`);
                                    handleDialogClick(user.advertisementId);
                                }}
                                style={{
                                    margin: '10px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    // Сравниваем ID объявления, а не пользователя
                                    background: activeDialog === user.advertisementId ? '#b7b7b7' : '#f9f9f9',
                                    transition: 'background-color 0.2s ease'
                                }}
                            >
                                <div>
                                    <strong>{user.firstName} {user.lastName}</strong>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                        {user.advertisementTitle || localStorage.getItem(`ad_context_${user.id}`) || 'Объявление'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Правая панель: Чат или Заглушка */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {recipientId ? (
                    <div>
                        <h3>Чат с пользователем</h3>
                        <div>
                            {MessageStore.messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        textAlign: msg.senderId === senderId ? 'right' : 'left'
                                    }}
                                >
                                    <span
                                        style={{
                                            background: msg.senderId === senderId ? '#dcf8c6' : '#fff'
                                        }}
                                    >{msg.content}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <input
                                type='text'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend}>Отправить</button>
                        </div>

                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#787878' }}>
                        <h2>Откройте диалог с продавцом</h2>
                    </div>
                )}
            </div>
        </div>
    );

})

export default Messages;