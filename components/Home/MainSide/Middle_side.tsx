import { Context } from '../../../src/main';
import './Middle_side.css'
import { useEffect, useState, useContext, useMemo } from 'react'
import {ModalInfo} from './ModalInfo'

function Middle_side({ searchQuery = '' }){
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)

    const [connectWithSeller, setConnectWithSeller] = useState(false)

    const [selectedAdvertisement, setSelectedAdvertisement] = useState<IADVERTISMENT | null>(null);

    const filterAdvertisements = useMemo(() => {
        if (!searchQuery.trim()) {
            return store.publicAdvertisements;
        }

        const query = searchQuery.toLowerCase().trim();
        
        return store.publicAdvertisements.filter(ad => {
            
            const searchInTitle = ad.city?.toLowerCase().includes(query);
            const searchInID = ad.id?.toLowerCase().includes(query);
            
            //const priceMatch = ad.price?.toString().includes(query);

            return searchInTitle || searchInID;
        });
    }, [store.publicAdvertisements, searchQuery]);

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
        
    const getImageUrl = (path: string) => {
        return `http://localhost:5000${path}`;
    };

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
                                            <div className='articul' style={{color: 'rgb(128, 128, 128)'}}>
                                                <span style={{color: 'rgba(120, 120, 120)'}}>Артикул:</span> {ad.id}
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