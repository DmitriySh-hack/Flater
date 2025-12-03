import { useEffect, useContext, useMemo } from "react";
import { Context } from '../../src/main';

function Favorite(){
    const {store} = useContext(Context)

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
            if(!store.isAuth) return;

            try{
                await store.getFavorites()
            }catch(e){
                console.log(e)
            }
        }
        loadFavoriteAd()
    }, [store.isAuth])

    if (!store.isAuth) {
        return (
            <div className="favorite-container">
                <div className="auth-required">
                    <h2>Требуется авторизация</h2>
                    <p>Для просмотра избранных объявлений необходимо войти в систему</p>
                    <a href="/login" className="login-link">Войти</a>
                </div>
            </div>
        );
    }

     return (
         <div className="favorites-grid">
                {uniqueFavorites.map((ad) => (
                    <div key={`${ad.id}-${Math.random()}`} className="favorite-card"> {/* Временно добавляем random */}
                        <div className="favorite-card-image">
                            <img 
                                src={ad.images && ad.images.length > 0 
                                    ? ad.images[0] 
                                    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png'}
                                alt={ad.title}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png';
                                }}
                            />
                            <button 
                                className="remove-favorite-btn"
                                onClick={() => handleRemoveFromFavorite(ad.id)}
                                title="Удалить из избранного"
                            >
                                ❌
                            </button>
                        </div>
                        
                        <div className="favorite-card-content">
                            <h3 className="favorite-card-title">{ad.title}</h3>
                            
                            <div className="favorite-card-price">
                                {ad.price.toLocaleString('ru-RU')} ₽
                            </div>
                            
                            <div className="favorite-card-details">
                                <div className="detail-item">
                                    <span className="detail-label">Город:</span>
                                    <span className="detail-value">{ad.city}</span>
                                </div>
                                
                                {ad.street && (
                                    <div className="detail-item">
                                        <span className="detail-label">Адрес:</span>
                                        <span className="detail-value">{ad.street}</span>
                                    </div>
                                )}
                                
                                {ad.countOfRooms && (
                                    <div className="detail-item">
                                        <span className="detail-label">Комнат:</span>
                                        <span className="detail-value">{ad.countOfRooms}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
    );
}
export default Favorite;