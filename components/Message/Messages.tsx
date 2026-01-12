import React, { useEffect, useState, useContext } from 'react'
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from 'react-router-dom';
import MessageStore from '../store/MessageStore';
import { Context } from '../../src/main';

const Messages: React.FC = observer(() => {
    const { store } = useContext(Context);
    const { id: recipientId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const senderId = store.user.id;
    const [inputValue, setInputValue] = useState('')

    //const [dialogIsOpen, setDialogIsOpen] = useState(false);

    useEffect(() => {
        MessageStore.fetchDialogs();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token && recipientId) {
            MessageStore.connect(token);
            MessageStore.fetchHistory(recipientId);
        }
    }, [recipientId])

    const handleSend = () => {
        if (!inputValue.trim() || !recipientId) return;
        MessageStore.sendMessage(senderId, recipientId, inputValue);
        setInputValue('')
    }
    // if (!recipientId) return (
    //     <div style={{ padding: '20px' }}>
    //         <h3>Сообщения</h3>
    //         {MessageStore.dialogs.length === 0 ? (
    //             <p>У вас пока нет диалогов</p>
    //         ) : (
    //             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
    //                 {MessageStore.dialogs.map(user => (
    //                     <div
    //                         key={user.id}
    //                         onClick={() => {
    //                             navigate(`/message/${user.id}`);
    //                             setDialogIsOpen(true);
    //                         }}
    //                         style={{
    //                             padding: '15px',
    //                             border: '1px solid #ddd',
    //                             borderRadius: '8px',
    //                             cursor: 'pointer',
    //                             background: '#f9f9f9'
    //                         }}
    //                     >
    //                         <strong>{user.firstName} {user.lastName}</strong>
    //                     </div>
    //                 ))}
    //             </div>
    //         )}
    //     </div>
    // );

    // if(dialogIsOpen) {
    //     return (
    //         <div>
    //             <h3>Чат с пользователем</h3>
    //             <div>
    //                 {MessageStore.messages.map((msg, index) => (
    //                     <div
    //                         key={index}
    //                         style={{
    //                             textAlign: msg.senderId === senderId ? 'right' : 'left'
    //                         }}
    //                     >
    //                         <span
    //                             style={{
    //                                 background: msg.senderId === senderId ? '#dcf8c6' : '#fff'
    //                             }}
    //                         >{msg.content}</span>
    //                     </div>
    //                 ))}
    //             </div>

    //             <div>
    //                 <input
    //                     type='text'
    //                     value={inputValue}
    //                     onChange={(e) => setInputValue(e.target.value)}
    //                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
    //                 />
    //                 <button onClick={handleSend}>Отправить</button>
    //             </div>

    //         </div>
    //     )
    // }
    
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Левая панель: Список диалогов */}
            <div style={{ width: '300px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <h3>Сообщения</h3>
                {MessageStore.dialogs.length === 0 ? (
                    <p>У вас пока нет диалогов</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        {MessageStore.dialogs.map(user => (
                            <div
                                key={user.id}
                                onClick={() => {
                                    navigate(`/message/${user.id}`);
                                }}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: '#f9f9f9'
                                }}
                            >
                                <strong>{user.firstName} {user.lastName}</strong>
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <h2>Откройте диалог</h2>
                    </div>
                )}
            </div>
        </div>
    );

})

export default Messages;