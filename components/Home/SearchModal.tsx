import { Modal } from '../Profile/ModalPagePassword/Modal'
import { useEffect, useContext, useState } from 'react';
import { Context } from '../../src/main';
import {useFilterContext} from './FilterContext/useFilterContext'
import './SearchModal.css'

export const SearchModal = ({
    isOpen,
    isClose,
} : {
    isOpen: boolean,
    isClose: () => void,
}) => {
    const { store } = useContext(Context);
    const { filters, setFilters, resetFilter } = useFilterContext();
    const [price, setPrice] = useState({
        from: filters.priceFrom || undefined,
        to: filters.priceTo || undefined
    })
    const [chooseCity, setChooseCity] = useState(filters.city)
    const [roomsCount, setRoomsCount] = useState<number | ''>(filters.rooms || '');

    useEffect(() => {
        store.getAllCities();
    }, []);
    
    const handleChangePrice = (field: 'from' | 'to', value?: number) => {
        setPrice(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilter = () => {
        setFilters({
            priceFrom: price.from,
            priceTo: price.to,
            city: chooseCity || undefined,
            rooms: roomsCount || undefined,
        });
        isClose();
    }

    const handleReset = () => {
        setPrice({ from: undefined, to: undefined });
        setChooseCity('');
        setRoomsCount('');
        resetFilter();
    };

    return(
        <Modal isOpen={isOpen} isClose={isClose}>
            <div className='modal-filter-container'>
                <h1 className='name-filter-modal'>Фильтры</h1>

                <hr></hr>

                <div className='info-filter-modal'>
                    <div className='inputs-filter-modal'>
                        от <input
                            className='priceTo-filter-modal'
                            type='number' 
                            placeholder='Цена от'
                            value={price.from || ''} 
                            onChange={(e) => handleChangePrice('from', 
                                e.target.value ? parseFloat(e.target.value) : undefined
                            )}
                        />
                        до <input 
                            className='priceFrom-filter-modal'
                            type='number' 
                            placeholder='Цена до' 
                            value={price.to || ''}
                            onChange={(e) => handleChangePrice('to',
                                e.target.value ? parseFloat(e.target.value) : undefined
                            )}
                        />
                    </div>
                    
                    <div className='cities-filter-modal-container'>
                        <div className='cities-filter-word'>Город:</div>
                        <div className='cities-filter-modal'>
                            <select
                                className='cities-filter-selector'
                                value={chooseCity}
                                onChange={(e) => setChooseCity(e.target.value)}
                            >
                                <option className='all-cities-filter' value="">Все города</option>

                                {store.cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='rooms-filter-modal-container'>
                        <span className='rooms-filter-word'>Кол-во комнат:</span>
                        <div className='rooms-filter-modal'>
                            <select
                                className='rooms-filter-selector'
                                value={roomsCount}
                                onChange={(e) => setRoomsCount(e.target.value ? parseInt(e.target.value) : '')}
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className='filter-btn-container'>
                    <button className='filter-btn-filter' onClick={() => {handleFilter()}}>Фильтрация</button>
                    <button className='filter-btn-reset' onClick={() => {handleReset()}}>Сбросить</button>
                </div>
            </div>
        </Modal>
    )
}