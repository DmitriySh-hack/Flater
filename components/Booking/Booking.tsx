import { observer } from "mobx-react-lite";
import './Booking.css'
import { Context } from '../../src/main';
import { useContext, useMemo, useEffect, useState } from "react";

const Booking = observer(() => {
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)

    const uniqueBooking = useMemo(() => {
        if (!store.booking || !Array.isArray(store.booking)) {
            return [];
        }
        
        const bookingMap = new Map();
        
        store.booking.forEach(book => {
            if (book && book.id) {
                if (!bookingMap.has(book.id)) {
                    bookingMap.set(book.id, book);
                } else {
                    console.log('Found duplicate:', book.id);
                }
            }
        });
        

        console.log(`Уникальных объявлений: ${bookingMap.size} из ${store.booking.length}`);
        return Array.from(bookingMap.values());
    }, [store.booking]);

    const handleRemoveFromBooking = async (advertisementId: string) => {
        if (!confirm('Удалить из избранного?')) return;
        
        try {
            await store.removeBooking(advertisementId);
            alert('Удалено из избранного');
        } catch (e) {
            console.error('Ошибка удаления:', e);
        }
    }

    useEffect(() => {
        const loadBookingAd = async () => {
            setIsLoading(true);

            try{
                await store.checkAuth();

                if(store.isAuth){
                    await store.getBookingAdvertisement()
                }
            }catch(e){
                console.log(e)
            }finally{
                setIsLoading(false)
            }
        }
        loadBookingAd()
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
                    <h2>Требуется авторизация</h2>
                    <p>Для просмотра избранных объявлений необходимо войти в систему</p>
                    <a href="/login" className="login-link">Войти</a>
                </div>
            </div>
        );
    }

    const getImageUrl = (path: string) => {
        return `http://localhost:5000${path}`;
    };

    return (
        <div className="main-container">
            <div className="name-container">
                <h1>NAME</h1>
            </div>
            <div className="workPlace-container">
                <div className="selectedAd-container">
                    {uniqueBooking.map((ad) => (
                        <div key={`${ad.id}-${Math.random()}`} className="booking-card">
                            <div className="booking-card-main">
                                <div className="booking-card-image">
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
                                
                                <div className="booking-card-content">
                                    <h3 className="booking-card-title">{ad.title}</h3>
                                    
                                    <div className="booking-card-price">
                                        {ad.price.toLocaleString('ru-RU')} ₽
                                    </div>
                                    
                                    <div className="booking-card-details">
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

                                        {ad.id && (
                                            <div>
                                                <span>Артикул:</span>
                                                <span>{ad.id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                className="remove-booking-btn"
                                onClick={() => handleRemoveFromBooking(ad.id)}
                                title="Удалить из избранного"
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>
                <div className="costAd-container">
                    <div className="costAd-set">
                        <h2 style={{marginBottom:'5px'}}>К оплате:</h2>

                        {uniqueBooking.map((ad) => (
                            <div className="ad-info">
                                <p>{ad.title}: {ad.price}</p>
                            </div>
                        ))}
                    </div>
                    <div className="costAd-price">
                        <div>
                            <p>Итог:</p>
                            <p style={{fontWeight: 'bold', fontSize: '24px'}}>
                                {uniqueBooking.reduce((sum, ad) => {
                                    const price = ad.price || 0;
                                    return sum + price;
                                }, 0).toLocaleString('ru-RU')} ₽
                            </p>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'right', marginTop:'7px'}}>
                            <button>Бронировать</button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
})

export default Booking