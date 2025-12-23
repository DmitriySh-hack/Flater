import { Modal } from '../../Profile/ModalPagePassword/Modal'
//import { Context } from '../../../src/main';
import { useState, useEffect } from 'react'
import type { IADVERTISMENT } from '../../models/IAdventisment';
import type { IUSER } from '../../models/IUser'
import './ModalInfo.css';

export const    ModalInfo = ({
    isOpen,
    isClose,
    advertisement
} : {
    isOpen: boolean,
    isClose: () => void,
    advertisement: IADVERTISMENT | null;
}) => {
    const [userInfo, setUserInfo] = useState<IUSER | null>(null)

    useEffect(() => {
        if (isOpen && advertisement) {
            if (advertisement.user) {
                // Если пользователь уже есть в объявлении (из getAllAdvertisments)
                setUserInfo(advertisement.user as IUSER);
            } else if (advertisement.userId) {
                // Если есть только user_id, загружаем информацию
                loadUserInfo();
            }
        }
    }, [isOpen, advertisement]);

    const loadUserInfo = async () => {
        if (!advertisement?.id) return;
        
        try {
            console.log('🔍 ModalInfo: Loading user info for advertisement:', advertisement.id);
            
            // Используем новый эндпоинт
            const response = await fetch(`http://localhost:5000/api/advertisements/${advertisement.id}/with-user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // если нужно
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ ModalInfo: Got user info:', data.user);
                setUserInfo(data.user);
            } else {
                console.error('❌ ModalInfo: Failed to load user info');
            }
        } catch (error) {
            console.error('❌ ModalInfo: Error loading user info:', error);
        }
    };

    const getSellerName = () => {
        const user = userInfo || advertisement?.user;
        
        if (!user) return "Продавец";
        
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
            return user.firstName;
        } else if (user.lastName) {
            return user.lastName;
        } else if (user.email) {
            return user.email.split('@')[0];
        }
        return "Продавец";
    };

    const getEmail = () => {
        return advertisement?.user?.email
    }

    return(
        <Modal isOpen={isOpen} isClose={isClose}>
            <div className='modal-info-container'>
                <h2 className='connectWithSeller'>Связь с продавцом</h2>
                <hr></hr>
                <div className='infoContainer'>
                    <div className='info-name'>Продавец: {getSellerName()}</div>
                    <div className='info-email'>Почта для связи: {getEmail()}</div>
                </div>

                <div className='writeLetterToOwner'>
                    <button className='letterToOwnerBTN'>Написать продавцу</button>
                </div>
            </div>
        </Modal>
)
    
}
