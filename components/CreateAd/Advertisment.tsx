import { observer } from 'mobx-react-lite';
import { useContext, useState, useEffect } from 'react';
import { Context } from '../../src/main';
import { CreateAdvirtisment } from './CreateAdvertismentModal/Modal'
import { CardOfFlat } from './cardOfFlat'
import './Advertisment.css'
import { useNavigate } from 'react-router-dom';

interface CreateAdData {
    title: string;
    price: number | null;
    city: string;
    street: string;
    countOfRooms: number;
    images?: File[];
}

export const Advertisment = observer(() => {
    const navigate = useNavigate()
    const {store} = useContext(Context)

    const [openModal, setOpenModal] = useState(false)
    
    useEffect(() => {
        if (store.isAuth) {
            store.getUserAdvertisments()
        }
    }, [store.isAuth])

    const handleCreateAd = async (adData: CreateAdData) => {
        try {
            // Вызываем новый метод с изображениями
            await store.createAdvertismentWithImages(
                adData.title,
                adData.price,
                adData.city,
                adData.street,
                adData.countOfRooms,
                adData.images // передаем файлы
            );
            
            setOpenModal(false);
        } catch (e) {
            console.log('Ошибка создания объявления:', e)
        }
    }

    const handleCloseAd = () => {
        setOpenModal(false)
        store.setAdvertisementError(null)
    }

    if(store.isAuth){
        return(
            <div className='main-container'>
                <div className='advertisement-create-container'>
                    <div className='advertisements-count'>Список Ваших объявлений: {store.userAdvertisment.length}</div>

                    <button className='advertisement-create-btn' onClick={() => setOpenModal(true)}>Добавить объявление</button>
                    <CreateAdvirtisment
                        isOpen = {openModal}
                        isClose = {handleCloseAd}
                        onCreate= {handleCreateAd}
                    />
                </div>
                
                <div>
                    <h3 className='your-ad'>Ваши объявления</h3>
                    {store.userAdvertisment.length === 0 ? (
                        <p>У вас нет объявлений</p>
                    ) : (
                        <div className='advertisement-container'>
                            {store.userAdvertisment.map(ad => (
                                <CardOfFlat key={ad.id} advertisement={ad}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )

        
    }

    if (!store.isAuth) {
        return (
            <div className="favorite-container">
                <div className="auth-required">
                    <h2 style={{fontSize: '32px'}}>Требуется авторизация</h2>
                    <p className='string-of-info'>Для создания объявления необходимо войти в систему</p>
                    <button onClick={() => navigate('/login')} className="login-link">Войти</button>
                </div>
            </div>
        );
    }
})