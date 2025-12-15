import { Modal } from '../Profile/ModalPagePassword/Modal'
import { useEffect, useContext, useState } from 'react';
import { Context } from '../../src/main';
import {useFilterContext} from './FilterContext/useFilterContext'

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
            <div>
                <h1>Фильтры</h1>

                <div>
                    <div>
                            от <input
                                type='number' 
                                placeholder='Цена от'
                                value={price.from || ''} 
                                onChange={(e) => handleChangePrice('from', 
                                    e.target.value ? parseFloat(e.target.value) : undefined
                                )}
                            /> 
                            до <input 
                                type='number' 
                                placeholder='Цена до' 
                                value={price.to || ''}
                                onChange={(e) => handleChangePrice('to',
                                    e.target.value ? parseFloat(e.target.value) : undefined
                                )}
                            />
                        </div>
                    
                    <div>
                        <span>Город</span>
                        <div>
                            <select
                                value={chooseCity}
                                onChange={(e) => setChooseCity(e.target.value)}
                            >
                                <option value="">Все города</option>

                                {store.cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <span>Кол-во комнат</span>
                        <div>
                            <select
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

                <button onClick={() => {handleFilter()}}>Фильтрация</button>
                <button onClick={() => {handleReset()}}>Сбросить</button>
            </div>
        </Modal>
    )
}