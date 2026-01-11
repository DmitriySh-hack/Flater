import { useEffect, useContext, useMemo, useState } from "react";
import { Context } from '../../src/main';
import './Favorite.css'
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

const Favorite = observer(() => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(true);

    const uniqueFavorites = useMemo(() => {
        if (!store.favorites || !Array.isArray(store.favorites)) {
            return [];
        }
        
        const favoritesMap = new Map();
        
        store.favorites.forEach(fav => {
            if (fav && fav.id) {
                if (!favoritesMap.has(fav.id)) {
                    favoritesMap.set(fav.id, fav);
                } else {
                    console.log('Found duplicate:', fav.id);
                }
            }
        });
        
        console.log(`Уникальных объявлений: ${favoritesMap.size} из ${store.favorites.length}`);
        return Array.from(favoritesMap.values());
    }, [store.favorites]);

    const handleRemoveFromFavorite = async (advertisementId: string) => {
        if (!confirm('Удалить из избранного?')) return;
        
        try {
            await store.removeFavorite(advertisementId);
            alert('Удалено из избранного');
        } catch (e) {
            console.error('Ошибка удаления:', e);
        }
    };

    useEffect(() => {
        const loadFavoriteAd = async () => {
            setIsLoading(true);

            try{
                await store.checkAuth();

                if(store.isAuth){
                    await store.getFavorites()
                }
            }catch(e){
                console.log(e)
            }finally{
                setIsLoading(false)
            }
        }
        loadFavoriteAd()
    }, [store.isAuth])
    
    if (isLoading) {
        return (
            <div className="favorite-container">
                <div className="loading">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!store.isAuth) {
        return (
            <div className="favorite-container">
                <div className="auth-required">
                    <h2 style={{fontSize: '32px'}}>Требуется авторизация</h2>
                    <p className='string-of-info'>Для просмотра избранного необходимо войти в систему</p>
                    <button onClick={() => navigate('/login')} className="login-link">Войти</button>
                </div>
            </div>
        );
    }

    const getImageUrl = (path: string) => {
        return `http://localhost:5000${path}`;
    };

    const handleBookingToggle = async(advertisementId: string) =>{
        if(!store.isAuth){
            alert('Войдите в систему, чтобы добавлять в избранное');
            return;
        }
        try{
            await store.toggleBooking(advertisementId)
            alert("Объявление добавлено в корзину избранного")
        }catch(error){
            console.error(error)
        }
    }

     return (
         <div className="favorites-grid">

            <div className="favorites-page-name">Избранное</div>

            <div className="favorites-grid-container">
                {uniqueFavorites.map((ad) => (
                    <div key={`${ad.id}-${Math.random()}`} className="favorite-card">
                        <div>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div className="favorite-card-image">
                                    <img 
                                        src={ad.images && ad.images.length > 0 
                                            ? getImageUrl(ad.images[0]) 
                                            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png'}
                                        alt={ad.title}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png';
                                        }}
                                        style={{width: '150px'}}
                                    />
                                </div>
                                
                                <div className="favorite-card-content">
                                    <h3 className="favorite-card-title">{ad.title}</h3>
                                    
                                    <div className="favorite-card-price">
                                        {ad.price.toLocaleString('ru-RU')} ₽/день
                                    </div>
                                    
                                    <div className="favorite-card-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Город: </span>
                                            <span className="detail-value">{ad.city}</span>
                                        </div>
                                        
                                        {ad.street && (
                                            <div className="detail-item">
                                                <span className="detail-label">Адрес: </span>
                                                <span className="detail-value">{ad.street}</span>
                                            </div>
                                        )}
                                        
                                        {ad.countOfRooms && (
                                            <div className="detail-item">
                                                <span className="detail-label">Комнат: </span>
                                                <span className="detail-value">{ad.countOfRooms}</span>
                                            </div>
                                        )}

                                        {ad.id && (
                                            <div className="articl">
                                                <span>Артикул:</span>
                                                <span>{ad.id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="favorite-booking-btn-container">
                            <div className="favorite-x-btn">
                                <button 
                                    className="remove-favorite-btn"
                                    onClick={() => handleRemoveFromFavorite(ad.id)}
                                    title="Удалить из избранного"
                                >
                                    ❌
                                </button>
                            </div>
                            

                            <div>
                                <button className="booking-btn" onClick={() => handleBookingToggle(ad.id)}>Забронировать</button>
                            </div>
                        </div>
                            
                    </div>
                    
                ))}
                
            </div>

                  
        </div>
    );
})
export default Favorite;