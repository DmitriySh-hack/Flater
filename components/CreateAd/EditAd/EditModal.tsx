import { Context } from '../../../src/main'
import { Modal } from '../../Profile/ModalPagePassword/Modal'
import type {AdvertisementData} from '../CreateAdvertismentModal/AdvertisementData'
import { useState, useContext} from 'react'

export const EditModal = ({
    isOpen,
    isClose,
    onEdit
} : {
    isOpen: boolean,
    isClose: () => void
    onEdit: (adData: AdvertisementData) => void
}) => {
    const {store} = useContext(Context)
    
    const [formData, setFormData] = useState({
        title: store.selectedAdvertisement?.title,
        price: store.selectedAdvertisement?.price,
        city: store.selectedAdvertisement?.city,
        street: store.selectedAdvertisement?.street,
        countOfRooms: store.selectedAdvertisement?.countOfRooms
    })

    const handleInputChange = (field: keyof AdvertisementData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleEditValues = () => {
        const dataToSend: AdvertisementData = {
            title: formData.title || '',
            price: formData.price || 0,
            city: formData.city || '',
            street: formData.street || '',
            countOfRooms: formData.countOfRooms || 1
        };

        onEdit(dataToSend)
        isClose()
    }

    return (
        <Modal isOpen={isOpen} isClose={isClose}>
            <div>
                <div>Наименование</div>
                <input
                    style={{marginBottom: '30px'}}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Введите название"
                />

                <div style={{marginBottom: '30px'}}>Число комнат: {
                    <select
                    value={formData.countOfRooms}
                    onChange={(e) => handleInputChange('countOfRooms', parseInt(e.target.value))}
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                    </select>
                }
                </div>
                

                <div>Город:</div>
                <input
                    style={{marginBottom: '30px'}}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Введите город"
                />
                
                <div>Улица:</div>
                <input
                    style={{marginBottom: '30px'}}
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder='Введите улицу'
                />

                <div>Цена:</div>
                <input
                    type='number'
                    style={{marginBottom: '30px'}}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder='Цена'
                />
            </div>

            <button onClick={handleEditValues}>Сохранить</button>
        </Modal>
    )
}