import { Context } from '../../../src/main';
import './Middle_side.css'
import filter from './filter.png'
import { useEffect, useState, useContext } from 'react'
import {ModalInfo} from './ModalInfo'

function Middle_side(){
    const placeh = ['Hello!', 'Hi!', 'Bonjuor!'];
    const [placehState, setPlacehState] = useState(0);
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)

    const [showFilter, setShowFilter] = useState(false);

    const [connectWithSeller, setConnectWithSeller] = useState(false)

    const [selectedAdvertisement, setSelectedAdvertisement] = useState<IADVERTISMENT | null>(null);

    const handleFilter = () => {
        setShowFilter(!showFilter);
    }

    const handleConnectWithSeller = (ad: IADVERTISMENT) => {
        setSelectedAdvertisement(ad);
        setConnectWithSeller(true);
    }


    useEffect(() => {
        if (store.isAuth && store.publicAdvertisements.length > 0) {
            store.loadFavoriteStatuses();
        }
    }, [store.isAuth, store.publicAdvertisements.length]);

    useEffect(() => {
        let currentIndex = 0;

        const intervale = setInterval(() => {
            currentIndex = (currentIndex + 1) % placeh.length;
            setPlacehState(currentIndex);
        }, 2000)

        return () => clearInterval(intervale);
    },[placeh.length]);

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

    const placeholder = placeh[placehState];

    const handleFavoriteToggle = async (advertisementId: string) => {
        if (!store.isAuth) {
            alert('Войдите в систему, чтобы добавлять в избранное');
            return;
        }
        try {
            await store.toggleFavorite(advertisementId);
        } catch(error) {
            console.error('Ошибка при изменении избранного:', error);
        }
    };

    const formPrice = (priceVal: number | null) => {
        if(priceVal === null) return 'Цена не указана'
        return `${priceVal.toLocaleString('ru-RU')} ₽`
    }
    
    const advertisementsToShow = store.publicAdvertisements.length > 0 
        ? store.publicAdvertisements 
        : [];
        
    const getImageUrl = (path: string) => {
        return `http://localhost:5000${path}`;
    };

    return (
        <div className="middle-side">
            <div className="search-section">
                <input 
                    className="search-input"
                    placeholder={placeholder}
                />
                <button className="filter-button" onClick={handleFilter}>
                    <img width="20px" src={filter} alt="Фильтр" />
                </button>
            </div>

            {isLoading && (
                <div className="loading-indicator">
                    Загрузка объявлений...
                </div>
            )}

            <div className="ads-count">
                Найдено {advertisementsToShow.length} объявлений
            </div>

            <div className="advertisements-grid">
                {advertisementsToShow.length === 0 ? (
                    <div className="no-ads-message">
                        Пока нет объявлений о квартирах
                        {store.isAuth && (
                            <a href="/advertisements" className="create-ad-link">
                                Создать первое объявление
                            </a>
                        )}
                    </div>
                ) : (
                    advertisementsToShow.map(ad => (
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
                                            {formPrice(ad.price)} ₽
                                        </div>

                                        <div className="ad-details">
                                            <div className="detail">
                                                <span className="detail-label">Комнат:</span>
                                                <span className="detail-value">{ad.countOfRooms}</span>
                                            </div>
                                            <div className="detail">
                                                <span className="detail-label">Адрес:</span>
                                                <span className="detail-value">{ad.city}, {ad.street}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{margin: '5px', display:'flex', justifyContent: 'right', alignItems: 'end'}}>
                                <button style={{marginRight: '4px'}} onClick={() => handleConnectWithSeller(ad)}>Связаться с продавцом</button>
                                <button>Забронировать</button>
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
}
import type { IADVERTISMENT } from '../../models/IAdventisment';

export default Middle_side