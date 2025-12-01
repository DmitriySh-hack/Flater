import { observer } from 'mobx-react-lite';
import { IADVERTISMENT } from "../models/IAdventisment";
import './cardOfFlar.css'
import { useState, useContext } from 'react';
import { Context } from '../../src/main';
import { EditModal } from './EditAd/EditModal'
import {AdvertisementData} from './CreateAdvertismentModal/AdvertisementData'

interface CardOfFlatProps {
    advertisement: IADVERTISMENT
}

export const CardOfFlat = observer((props: CardOfFlatProps) => {
    const {advertisement} = props;
    const { id, title, price, city, street, countOfRooms, images } = advertisement
    const {store} = useContext(Context)
    const [openModal, setOpenModal] = useState(false)

    const [image, setImage] = useState(false)
    const defaultPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png?20210118073241'

    const currentImage = (images && images.length > 0 && !image) ? images[0] : defaultPhoto;

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

    return (
        <div className='flar-card__container'>
            <div className='flat-card__up-container'>
                <div className="flat-card__image">
                    <img 
                        src={currentImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImage(true)}
                    />
                </div>
                
                <div className='flat-card__title'>
                    <h3>{title}</h3>
                    <p>{price.toLocaleString('ru-RU')} ₽</p>
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