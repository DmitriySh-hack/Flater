import { Context } from '../../../src/main';
import './Middle_side.css'
import { useEffect, useState, useContext, useMemo } from 'react'
import {ModalInfo} from './ModalInfo'
import type { IADVERTISMENT } from '../../models/IAdventisment';
import { observer } from 'mobx-react-lite';
import { useFilterContext } from '../FilterContext/useFilterContext';
import { useNavigate } from 'react-router-dom';

interface MiddleSideProps {
    searchQuery?: string;
}

const Middle_side = observer(({ searchQuery = '' } : MiddleSideProps) =>{
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const {filters} = useFilterContext()

    const [connectWithSeller, setConnectWithSeller] = useState(false)

    const [selectedAdvertisement, setSelectedAdvertisement] = useState<IADVERTISMENT | null>(null);

    const filterAdvertisements = useMemo(() => {
        let filteredAds = store.publicAdvertisements;

        // 1. Применяем текстовый поиск
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredAds = filteredAds.filter(ad => {
                const searchInTitle = ad.city?.toLowerCase().includes(query);
                const searchInID = ad.id?.toLowerCase().includes(query);
                return searchInTitle || searchInID;
            });
        }

        // 2. Применяем фильтры из контекста
        // Фильтр по цене "от"
        if (filters.priceFrom !== undefined && filters.priceFrom !== null) {
            filteredAds = filteredAds.filter(ad => 
                ad.price !== null && ad.price >= filters.priceFrom!
            );
        }

        // Фильтр по цене "до"
        if (filters.priceTo !== undefined && filters.priceTo !== null) {
            filteredAds = filteredAds.filter(ad => 
                ad.price !== null && ad.price <= filters.priceTo!
            );
        }

        // Фильтр по городу
        if (filters.city && filters.city.trim() !== '') {
            filteredAds = filteredAds.filter(ad => 
                ad.city?.toLowerCase() === filters.city!.toLowerCase()
            );
        }

        // Фильтр по количеству комнат
        if (filters.rooms !== undefined && filters.rooms !== null) {
            filteredAds = filteredAds.filter(ad => 
                ad.countOfRooms === filters.rooms
            );
        }

        console.log('Фильтры применены:', {
            priceFrom: filters.priceFrom,
            priceTo: filters.priceTo,
            city: filters.city,
            rooms: filters.rooms,
            resultCount: filteredAds.length
        });

        return filteredAds;
    }, [store.publicAdvertisements, searchQuery, filters]);

    const handleConnectWithSeller = (ad: IADVERTISMENT) => {
        if (!store.isAuth) {
            navigate('/message')
        }
        setSelectedAdvertisement(ad);
        setConnectWithSeller(true);
    }

    useEffect(() => {
        if (store.isAuth && store.publicAdvertisements.length > 0) {
            store.loadFavoriteStatuses();
        }
    }, [store.isAuth, store.publicAdvertisements.length]);

    useEffect(() => {
        if(store.isAuth && store.publicAdvertisements.length > 0) {
            store.loadBookingStatus()
        }
    }, [store.isAuth, store.publicAdvertisements.length])

    useEffect(() => {
        const loadAdvertisment = async () => {
            try{
                setIsLoading(true)
                await store.getAllAdvertisments()
            }catch(e){
                console.log(e)
            }finally{
                setIsLoading(false)
            }
        }

        loadAdvertisment()
    }, [store])

    

    const handleFavoriteToggle = async (advertisementId: string) => {
        if (!store.isAuth) {
            navigate('/favorite')
        }
        try {
            await store.toggleFavorite(advertisementId);
        } catch(error) {
            console.error('Ошибка при изменении избранного:', error);
        }
    };

    const handleBookingToggle = async (advertisementId: string) => {
        if(!store.isAuth){
            navigate('/booking')
        }
        try{
            await store.toggleBooking(advertisementId)
        }catch(error){
            console.error(error)
        }
    }

    const formPrice = (priceVal: number | null) => {
        if(priceVal === null) return 'Цена не указана'
        return `${priceVal.toLocaleString('ru-RU')} ₽`
    }
        
    const getImageUrl = (path: string) => {
        return `http://localhost:5000${path}`;
    };

    const renderActiveFilters = () => {
        const activeFilters = [];
        
        if (filters.priceFrom) activeFilters.push(`Цена от: ${filters.priceFrom} руб`);
        if (filters.priceTo) activeFilters.push(`Цена до: ${filters.priceTo} руб`);
        if (filters.city) activeFilters.push(`Город: ${filters.city}`);
        if (filters.rooms) activeFilters.push(`Комнат: ${filters.rooms}`);
        
        if (activeFilters.length === 0) return null;
        
        return (
            <div className="active-filters" style={{
                margin: '10px 0',
                padding: '10px',
                background: '#f0f8ff',
                border: '1px solid #d1e7ff',
                borderRadius: '5px'
            }}>
                <strong>Примененные фильтры:</strong> {activeFilters.join(' | ')}
                <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em'}}>
                    ({filterAdvertisements.length} объявлений)
                </span>
            </div>
        );
    };

    //let countOfObjects = filterAdvertisements.length;

    return (
        <div className="middle-side">
            {isLoading && (
                <div className="loading-indicator">
                    Загрузка объявлений...
                </div>
            )}

            <div className="ads-count">
                Найдено {filterAdvertisements.length} объявлений
            </div>

            {renderActiveFilters()}

            <div className="advertisements-grid">
                {filterAdvertisements.length === 0 ? (
                    <div className="no-ads-message">
                        Пока нет объявлений о квартирах
                        {store.isAuth && (
                            <a href="/advertisements" className="create-ad-link">
                                Создать первое объявление
                            </a>
                        )}
                    </div>
                ) : (
                    filterAdvertisements.map(ad => (
                        <div key={ad.id} className="ad-card-public">
                            <div className="ad-image-container">
                                <img 
                                    src={ad.images && ad.images.length > 0 ? getImageUrl(ad.images[0]) : 'default-photo.jpg'} 
                                    alt={ad.title}
                                    className="ad-image"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png?20210118073241';
                                    }}
                                />
                                <div className='info-container'>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <h3 className="ad-title">{ad.title}</h3>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <button
                                                className={`heart-button ${store.isAdvertisementFavorite(ad.id) ? 'favorite' : ''}`}
                                                onClick={() => handleFavoriteToggle(ad.id)}
                                                title={store.isAdvertisementFavorite(ad.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                            />          
                                        </div>    
                                    </div>
                                    <div className="ad-content">
                                        <div className="price-badge">
                                            {formPrice(ad.price)}/день
                                        </div>

                                        <div className="ad-details">
                                            <div className="detail">
                                                <span className="detail-label">Комнат: </span>
                                                <span className="detail-value">{ad.countOfRooms}</span>
                                            </div>
                                            <div className="detail">
                                                <span className="detail-label">Адрес: </span>
                                                <span className="detail-value">{ad.city}, {ad.street}</span>
                                            </div>
                                            <div className='articul' style={{color: 'rgb(128, 128, 128)'}}>
                                                <span style={{color: 'rgba(120, 120, 120)'}}>Артикул:</span> {ad.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{margin: '5px', display:'flex', justifyContent: 'right', alignItems: 'end'}}>
                                <button className = "connecting-btn" onClick={() => handleConnectWithSeller(ad)}>Связаться с продавцом</button>
                                <button className = "booking-btn"
                                style={{backgroundColor: (!store.isAdvertisementBooking(ad.id)) ? '' : 'grey'}}
                                onClick={() => handleBookingToggle(ad.id)} >{(!store.isAdvertisementBooking(ad.id)) ? 'Забронировать' : 'Удалить бронь'}</button>
                            </div>
                        </div>
                    ))
                )}
                <ModalInfo
                    isOpen={connectWithSeller}
                    isClose={() => setConnectWithSeller(false)}
                    advertisement={selectedAdvertisement}
                />
            </div>
        </div>
    )
})

export default Middle_side