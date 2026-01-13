import React, { useEffect, useState, useContext, useRef } from 'react'
import { observer } from "mobx-react-lite";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MessageStore from '../store/MessageStore';
import { Context } from '../../src/main';
import './Messages.css'
import send from './send.png'

function useAutoResize() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('input', autoResize);

            autoResize();

            return () => {
                textarea.removeEventListener('input', autoResize);
            };
        }
    }, []);

    return textareaRef;
}

const Messages: React.FC = observer(() => {
    const { store } = useContext(Context);
    const { id: recipientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const senderId = store.user.id;
    const [inputValue, setInputValue] = useState('')

    const [titleChat, setTitleChat] = useState<string | undefined>(undefined)

    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const adId = searchParams.get('adId');
    const textareaRef = useAutoResize();

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

    if (!store.isAuth) {
        return (
            <div className="favorite-container">
                <div className="auth-required">
                    <h2 style={{ fontSize: '32px' }}>Требуется авторизация</h2>
                    <p className='string-of-info'>Чтобы связаться нужно войти в систему</p>
                    <button onClick={() => navigate('/login')} className="login-link">Войти</button>
                </div>
            </div>
        );
    }

    return (
        <div className='message-container'>
            {/* Левая панель: Список диалогов */}
            <div className='main-container-of-leftside'>
                <h3 style={{ marginLeft: '15px', marginTop: '10px' }}>Сообщения</h3>
                {MessageStore.dialogs.length === 0 ? (
                    <p style={{paddingLeft: '10px', paddingTop: '5px'}}>У вас пока нет диалогов</p>
                ) : (
                    <div className='work-container-of-leftside'>
                        {MessageStore.dialogs.map((user, index) => (
                            <div
                                key={`${user.id}-${user.advertisementId || index}`}
                                onClick={() => {
                                    navigate(`/message/${user.id}${user.advertisementId ? `?adId=${user.advertisementId}` : ''}`);
                                    handleDialogClick(user.advertisementId);
                                    setTitleChat(user.advertisementTitle)
                                }}
                                style={{
                                    margin: '10px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: activeDialog === user.advertisementId ? '#c1c1c1' : '#f9f9f9',
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex', 
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div>
                                    <strong>{user.firstName} {user.lastName}</strong>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#5a5a5a' }}>
                                        {user.advertisementTitle || localStorage.getItem(`ad_context_${user.id}`) || 'Объявление'}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Удалить переписку?')) {
                                            MessageStore.deleteDialog(user.id, user.advertisementId);
                                        }
                                    }}
                                    style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer', fontSize: '18px'}}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Правая панель: Чат или Заглушка */}
            <div className='main-container-of-rigthside'>
                {recipientId ? (
                    <div className='work-container-of-rigthside' >
                        <h3>{titleChat}</h3>
                        <div className='message-with-seller'>
                            {MessageStore.messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        textAlign: msg.senderId === senderId ? 'right' : 'left',
                                        marginBottom: '10px',
                                        marginRight: '20px',
                                        marginLeft: '20px',
                                        paddingBottom: '10px'
                                    }}
                                >
                                    <span
                                        style={{
                                            background: msg.senderId === senderId ? '#dcf8c6' : '#fff',
                                        }}
                                    >{msg.content}</span>
                                </div>
                            ))}
                        </div>

                        <div className='input-container-message'>
                            <textarea
                                rows={1}
                                ref={textareaRef}
                                className='input-your-message'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            ></textarea>
                            <button className='button-your-message' onClick={handleSend}>
                                <img src={send} width='30px' />
                            </button>
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