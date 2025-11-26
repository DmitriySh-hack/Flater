    import { useState } from 'react';
    import { Modal } from '../../Profile/ModalPagePassword/Modal'
    interface AdvertisementData {
        title: string;
        price: number;
        city: string;
        street: string;
        countOfRooms: number;
    }

    export const CreateAdvirtisment = ({
        isOpen,
        isClose,
        onCreate
    } : {
        isOpen: boolean,
        isClose: () => void
        onCreate: (adData: AdvertisementData) => void
    }
    ) => {
        const [formData, setFormData] = useState({
            title: '',
            price: 0,
            city: '',
            street: '',
            countOfRooms: 1
        })

        const handleInputChange = (field: keyof AdvertisementData, value: string | number) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        const handleCreate = () => {
            if(!formData.title || !formData.city || !formData.street || formData.price <= 0){
                alert('Заполните все обязательные поля')
                return
            }

            onCreate(formData);
        }

        return (
                <Modal isOpen={isOpen} isClose={isClose}>
                    <h2>Создание объявления</h2>

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
                                <option value={1}>2</option>
                                <option value={1}>3</option>
                                <option value={1}>4</option>
                                <option value={1}>5</option>
                                <option value={1}>6</option>
                                <option value={1}>7</option>
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
                    

                    <button onClick={handleCreate}>Создать</button>
                    <button onClick={isClose}>Отмена</button>
                </Modal>
        )
    }