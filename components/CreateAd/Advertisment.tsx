import { observer } from 'mobx-react-lite';
import { useContext, useState, useEffect } from 'react';
import { Context } from '../../src/main';
import { useNavigate } from 'react-router-dom';
import { CreateAdvirtisment } from './CreateAdvertismentModal/Modal'
import { CardOfFlat } from './cardOfFlat'
import './Advertisment.css'

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

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontSize: '24px'}}>
            <div>Войдите в аккаунт</div>
            <button onClick={() => {navigate('/login')}}>Войти</button>
        </div>
    )
})