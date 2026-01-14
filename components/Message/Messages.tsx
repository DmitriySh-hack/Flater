import React, { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { observer } from "mobx-react-lite";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MessageStore from '../store/MessageStore';
import { Context } from '../../src/main';
import './Messages.css'
import send from './send.png'
import dot from './dot.png'

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

// Хук для отслеживания видимости сообщений
function useMessageObserver() {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const observedMessagesRef = useRef<Set<string>>(new Set());
    
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observedMessagesRef.current.clear();
            }
        };
    }, []);
    
    const setupObserver = useCallback((callback: (messageId: string, userId: string) => void) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.getAttribute('data-message-id');
                        const userId = entry.target.getAttribute('data-user-id');
                        
                        if (messageId && userId && !observedMessagesRef.current.has(messageId)) {
                            observedMessagesRef.current.add(messageId);
                            callback(messageId, userId);
                            
                            // Можно отписаться после обработки
                            if (observerRef.current) {
                                observerRef.current.unobserve(entry.target);
                            }
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -50px 0px', // Не учитывать нижние 50px
                threshold: 0.3 // 30% сообщения должно быть видно
            }
        );
    }, []);
    
    const observeElement = useCallback((element: HTMLElement, messageId: string, userId: string) => {
        if (observerRef.current && element && !observedMessagesRef.current.has(messageId)) {
            element.setAttribute('data-message-id', messageId);
            element.setAttribute('data-user-id', userId);
            observerRef.current.observe(element);
        }
    }, []);
    
    return { setupObserver, observeElement, observedMessagesRef };
}

const Messages: React.FC = observer(() => {
    const { store } = useContext(Context);
    const { id: recipientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const senderId = store.user.id;
    const [inputValue, setInputValue] = useState('');
    const [titleChat, setTitleChat] = useState<string | undefined>(undefined);
    const [activeDialog, setActiveDialog] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const adId = searchParams.get('adId');
    const textareaRef = useAutoResize();
    
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { setupObserver, observeElement, observedMessagesRef } = useMessageObserver();
    
    // Обработчик для видимых сообщений
    const handleMessageVisible = useCallback((messageId: string, userId: string) => {
        console.log(`Сообщение id: ${messageId} стало видимым на экране`);
        
        // Находим сообщение для логирования
        const message = MessageStore.messages.find(msg => 
            msg.id?.toString() === messageId || msg.id === Number(messageId)
        );
        
        if (message && !message.isRead) {
            console.log(`Сообщение: "${message.content}", id: ${messageId}, status: прочитано (автоматически)`);
            MessageStore.messageRead(messageId, userId);
        }
    }, []);
    
    // Настройка observer при изменении recipientId
    useEffect(() => {
        setupObserver(handleMessageVisible);
    }, [recipientId, setupObserver, handleMessageVisible]);
    
    // Наблюдение за сообщениями после их рендеринга
    useEffect(() => {
        if (recipientId && MessageStore.messages.length > 0) {
            // Даем время DOM обновиться
            const timer = setTimeout(() => {
                // Наблюдаем только за входящими непрочитанными сообщениями
                MessageStore.messages.forEach(msg => {
                    if (msg.id && msg.senderId === recipientId && !msg.isRead) {
                        const element = document.querySelector(`[data-message-element="${msg.id}"]`) as HTMLElement;
                        if (element) {
                            observeElement(element, msg.id.toString(), recipientId);
                        }
                    }
                });
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [MessageStore.messages, recipientId, observeElement]);
    
    // Логирование всех сообщений при загрузке
    useEffect(() => {
        if (recipientId && MessageStore.messages.length > 0) {
            console.log('=== СООБЩЕНИЯ В ДИАЛОГЕ ===');
            
            MessageStore.messages.forEach((msg, index) => {

                const status = msg.isRead ? `прочитано` : `не прочитано`;
                console.log(`${index + 1}. "${msg.content}" (id: ${msg.id || 'нет'}) - ${status}`);
            });
            console.log('==========================');
        }
    }, [recipientId, MessageStore.messages.length]);

    useEffect(() => {
        MessageStore.fetchDialogs();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token && recipientId) {
            MessageStore.connect(token);
            MessageStore.fetchHistory(recipientId, adId || undefined);
        }
    }, [recipientId, adId]);
    
    // При загрузке компонента устанавливаем активный диалог из URL
    useEffect(() => {
        if (adId) {
            setActiveDialog(adId);
        }
    }, [adId]);

    const handleSend = () => {
        if (!inputValue.trim() || !recipientId) return;
        MessageStore.sendMessage(senderId, recipientId, inputValue, adId || undefined);
        setInputValue('');
        
        // Автоматическая прокрутка к новому сообщению
        setTimeout(() => {
            messagesContainerRef.current?.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    };
    
    // Обработчик Enter для отправки (с Shift для новой строки)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                                    setTitleChat(user.advertisementTitle);
                                    observedMessagesRef.current.clear();
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
                                    justifyContent: 'space-between',
                                    position:'relative'
                                }}
                            >
                                <div>
                                    <strong>{user.firstName} {user.lastName}</strong>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#5a5a5a' }}>
                                        {user.advertisementTitle || localStorage.getItem(`ad_context_${user.id}`) || 'Объявление'}
                                    </p>
                                </div>
                                    
                                <div style={{display:'flex', flexDirection: 'row', alignItems: 'center', }}>
                                    {user.unreadCount > 0 ? (<div style={{position:'absolute', top:'-6%', left: '-2%'}}><img src={dot}/></div>) : (null)}
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

                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Правая панель: Чат */}
            <div className='main-container-of-rigthside'>
                {recipientId ? (
                    <div className='work-container-of-rigthside'>
                        <h3>{titleChat || 'Диалог'}</h3>
                        
                        {/* Контейнер для сообщений с автоскроллом */}
                        <div 
                            className='message-with-seller'
                            ref={messagesContainerRef}
                            style={{
                                overflowY: 'auto',
                                maxHeight: 'calc(100vh - 200px)',
                                padding: '10px'
                            }}
                        >
                            {MessageStore.messages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
                                    data-message-element={msg.id}
                                    style={{
                                        textAlign: msg.senderId === senderId ? 'right' : 'left',
                                        marginBottom: '15px',
                                        position: 'relative'
                                    }}
                                >
                                    <div
                                        style={{
                                            background: msg.senderId === senderId ? '#dcf8c6' : '#ececec',
                                            padding: '10px 15px',
                                            borderRadius: '15px',
                                            display: 'inline-block',
                                            maxWidth: '70%',
                                            wordBreak: 'break-word',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ marginBottom: '5px' }}>{msg.content}</div>
                                        
                                        {/* Статус сообщения */}
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#666',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '5px'
                                        }}>
                                            <span>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                }) : ''}
                                            </span>
                                            
                                            <span style={{
                                                letterSpacing:'-3px',
                                                fontSize: '10px',
                                                fontStyle: 'italic'
                                            }}>
                                                {msg.isRead ? '✓✓' : '✓'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Поле ввода */}
                        <div className='input-container-message'>
                            <textarea
                                rows={1}
                                ref={textareaRef}
                                className='input-your-message'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className='button-your-message' onClick={handleSend}>
                                <img src={send} width='30px' alt="Отправить" />
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
});

export default Messages;