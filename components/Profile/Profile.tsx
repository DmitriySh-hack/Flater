import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../src/main';
import './Profile.css';
import { ChangePasswordModal } from './ModalPagePassword/ChangePasswordModal';
import { Avatar } from './Avatar/Avatar';
import OrderService from '../service/OrderService';
import type { IOrder } from '../models/IOrder';
import { formatOrderDate, isMoveInConfirmed } from '../utils/orderUtils';

export const Profile = observer(() => {
    
    const [inputValue, setInputValue] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [firstVal, setFirstVal] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const navigate = useNavigate()
    const {store} = useContext(Context)

    const saveChanges = async (fieldName: 'firstName' | 'lastName' | 'email') => {
        try{ 
            const value = inputValue[fieldName]
            await store.updateProfile({ [fieldName]: value})
            setFirstVal(prev => ({...prev, [fieldName]: value}))
        }catch(error){
            console.error('Ошибка при сохранение', error)
        }
    }

    const cancelChanges = (fieldName: 'firstName' | 'lastName' | 'email') => {
        setInputValue(prev => ({...prev, [fieldName]: firstVal[fieldName]}))
    }

    useEffect(() => {
        if (store.user) {
            const userData = {
                firstName: store.user.firstName || '',
                lastName: store.user.lastName || '',
                email: store.user.email || ''
            }
            setInputValue(userData);
            setFirstVal(userData);
        }
    }, [store.user]);

    useEffect(() => {
        const loadOrders = async () => {
            if (!store.isAuth || !store.user.isActivated) return;
            setOrdersLoading(true);
            try {
                const { data } = await OrderService.getMyOrders();
                setOrders(data);
            } catch (e) {
                console.error('Ошибка загрузки заказов:', e);
            } finally {
                setOrdersLoading(false);
            }
        };
        void loadOrders();
    }, [store.isAuth, store.user?.isActivated]);

    const handleConfirmMoveIn = async (orderId: string) => {
        if (!confirm('Подтвердить заселение по этому заказу?')) return;
        try {
            await OrderService.confirmMoveIn(orderId);
            const { data } = await OrderService.getMyOrders();
            setOrders(data);
            alert('Заселение подтверждено');
        } catch (e) {
            console.error(e);
            alert('Не удалось подтвердить заселение');
        }
    };

    const handleHideOrder = async (orderId: string) => {
        if (!confirm('Убрать заказ из списка в профиле? В CRM он останется.')) return;
        try {
            await OrderService.hideFromProfile(orderId);
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch (e) {
            console.error(e);
            alert('Не удалось убрать заказ из списка');
        }
    };

    const handleInputChange = (fieldName: string, value: string) => {
        setInputValue(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleChangePassword = async (oldPassword: string, newPassword: string) => {
        try{
            await store.changePassword(oldPassword, newPassword);
            alert('Пароль умпешно изменен')
        }catch(error){
            alert('Ошибка')
            console.error(error)
        }
    }

    if(!store.isAuth){
        return (
            <div className='no-Auth-Profile'>
                <div style={{fontSize: '30px', padding: '3px', fontWeight: 'bold'}}>Вы не авторизованы!</div>
                <div className='buttons-for-no-auth'>
                    <button style={{marginRight: '3px'}} onClick={() => navigate('/login')}>Войти</button>
                    <button onClick={() => navigate('/registration')}>Зарегистрироваться</button>
                </div>
                
            </div>
        )
    }

    if(store.isAuth && store.user.isActivated === false){
        return (
            <div>
                Подтвердите профиль на почте
                <button onClick={() => {store.logout()}}>Logout</button>
            </div>
        )
    }

    if(store.isAuth && store.user.isActivated === true){
        return (
        <div className='main-page'>

            <div className="profile-layout">
                <div className="profile-layout__avatar">
                    <Avatar/>
                </div>
            <div className='main-container'>
                <p className='wellcome-words'>Добро пожаловать в профиль!</p>
                <div className='profile-form'>
                    <div className='first-name'>
                        <input className='input-first-name' type="text" value={inputValue.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                    </div>

                    <div className='last-name'>
                        <input className='input-last-name' type="text" value={inputValue.lastName} 
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                    </div>

                    <div className='email'>
                        <input className='input-email' type="text" value={inputValue.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}/>
                    </div>

                    
                        
                    <div className='down-buttons'>
                        <button className='change-password-btn' onClick={() => {setIsChangePasswordModalOpen(true)}}>Изменить пароль</button>
                        <button className='logout-btn' onClick={() => {store.logout()}}>Выйти</button>
                    </div>    
                </div>
                        
                <div className='saveChangesProfile'><>
                    <button className='save-changes-btn' style={{cursor: 'pointer'}} onClick={() => {
                        saveChanges('firstName');
                        saveChanges('lastName');
                        saveChanges('email');
                    }}>Сохранить изменения</button>
                    <button className='delete-changes-btn' style={{cursor: 'pointer'}} onClick={() => {
                        cancelChanges('firstName');
                        cancelChanges('lastName');
                        cancelChanges('email');
                    }}>Отменить изменения</button>
                        </>
                </div>

                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    isClose={() => setIsChangePasswordModalOpen(false)}
                    onChangePassword={handleChangePassword}
                />

                <div className="profile-orders">
                    <h3 className="profile-orders__title">Мои заказы</h3>
                    {ordersLoading && <p>Загрузка заказов...</p>}
                    {!ordersLoading && orders.length === 0 && (
                        <p className="profile-orders__empty">Заказов пока нет</p>
                    )}
                    {!ordersLoading && orders.map((order) => (
                        <div key={order.id} className="profile-orders__card">
                            <button
                                type="button"
                                className="profile-orders__hide-btn"
                                onClick={() => handleHideOrder(order.id)}
                                title="Убрать из списка"
                            >
                                ✕
                            </button>
                            <p><strong>Заказ:</strong> {order.id}</p>
                            <p><strong>Цена:</strong> {Number(order.price).toLocaleString('ru-RU')} ₽</p>
                            <p><strong>Продавец:</strong> {order.seller_id}</p>
                            <p>
                                <strong>Заселение:</strong>{' '}
                                {isMoveInConfirmed(order.move_in_confirmed) ? 'Подтверждено' : 'Не подтверждено'}
                            </p>
                            {order.created_at && (
                                <p><strong>Создан:</strong> {formatOrderDate(order.created_at)}</p>
                            )}
                            {!isMoveInConfirmed(order.move_in_confirmed) && (
                                <button
                                    type="button"
                                    className="profile-orders__confirm-btn"
                                    onClick={() => handleConfirmMoveIn(order.id)}
                                >
                                    Подтвердить заселение
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </div>   
        )
    }

    return (
        <div>
            Profile Page
        </div>
    )
});

