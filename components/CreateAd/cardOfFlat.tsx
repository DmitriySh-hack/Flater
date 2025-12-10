import { observer } from 'mobx-react-lite';
import type { IADVERTISMENT } from "../models/IAdventisment";
import './cardOfFlar.css'
import { useState, useContext } from 'react';
import { Context } from '../../src/main';
import { EditModal } from './EditAd/EditModal'
import type {AdvertisementData} from './CreateAdvertismentModal/AdvertisementData'

interface CardOfFlatProps {
    advertisement: IADVERTISMENT
}

export const CardOfFlat = observer((props: CardOfFlatProps) => {
    const {advertisement} = props;
    const { id, title, price, city, street, countOfRooms, images } = advertisement
    const {store} = useContext(Context)
    const [openModal, setOpenModal] = useState(false)
    const [imageError, setImageError] = useState(false)

    const defaultPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png?20210118073241'

    // Берем первое изображение или дефолтное
    const currentImage = images && images.length > 0 && !imageError 
        ? `http://localhost:5000${images[0]}` // Добавляем адрес сервера
        : defaultPhoto;

    const handleDeleteAd = async () => {
        try{
            await store.deleteAdvertisment(id)
        }catch(error){
            console.log('Удаление не удалось: ', error)
        }
    }

    const handleCloseAd = () => {
        setOpenModal(false)
    }

    const handleOpenAd = () => {
        store.setSelectedAd(advertisement);
        setOpenModal(true);
    }

    const handleEditAd = async (adData: AdvertisementData) => {
        try{
            await store.updateAdvertisment(id, adData)
            handleCloseAd();
        }catch(error){
            console.log('Редактирование не удалось!', error)
        }
    }

    const formPrice = (priceVal: number | null) => {
        if(priceVal === null) return 'Цена не указана'
        return `${priceVal.toLocaleString('ru-RU')} ₽`
    }

    return (
        <div className='flar-card__container'>
            <div className='flat-card__up-container'>
                <div className="flat-card__image">
                    <img 
                        src={currentImage}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImageError(true)}
                    />
                </div>
                
                <div className='flat-card__title'>
                    <h3>{title}</h3>
                    <p>{formPrice(price)}</p>
                </div>
            </div>

            <div className='flat-card__info'>
                <span>Комнат: {countOfRooms}</span>
                <span>Адрес: {city}, {street}</span>
            </div>

            <div className='flat-card__rebuilder'>
                <button style={{margin: '5px'}} onClick={handleOpenAd}>Редактировать</button>
                <EditModal
                    isOpen = {openModal}
                    isClose = {handleCloseAd}
                    onEdit = {handleEditAd}
                />
                <button onClick={handleDeleteAd} style={{margin: '5px'}}>Удалить</button>
            </div>
        </div>
    )
})