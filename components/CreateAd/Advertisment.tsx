import { observer } from 'mobx-react-lite';
import { useContext, useState, useEffect } from 'react';
import { Context } from '../../src/main';
import { useNavigate } from 'react-router-dom';
import { CreateAdvirtisment } from './CreateAdvertismentModal/Modal'
import { CardOfFlat } from './cardOfFlat'
import './Advertisment.css'

interface CreateAdData {
    title: string;
    price: number;
    city: string;
    street: string;
    countOfRooms: number;
    images?: string[];
}

export const Advertisment = observer(() => {
    const navigate = useNavigate()
    const {store} = useContext(Context)

    const [openModal, setOpenModal] = useState(false)
    
    useEffect(() => {
        if (store.isAuth) {
            store.getAdvertismentCount()
            store.getUserAdvertisments()
        }
    }, [store.isAuth])

    const handleCreateAd = async (adData: CreateAdData) => {
        try {
            const submissionData = {
                ...adData,
                images: adData.images || [] 
            }

            await store.createAdvertisment(submissionData) 
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
                <div style={{fontSize: '18px'}}>Список Ваших объявлений: {store.advertismentCount}</div>


                <button onClick={() => setOpenModal(true)}>Создать объявление</button>
                <CreateAdvirtisment
                    isOpen = {openModal}
                    isClose = {handleCloseAd}
                    onCreate= {handleCreateAd}
                />

                <div>
                    <h3>Ваши объявления</h3>
                    {store.userAdvertisment.length === 0 ? (
                        <p>У вас нет объявлений</p>
                    ) : (
                        <div>
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