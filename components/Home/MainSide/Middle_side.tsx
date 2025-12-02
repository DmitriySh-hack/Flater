import { Context } from '../../../src/main';
import './Middle_side.css'
import filter from './filter.png'
import { useEffect, useState, useContext } from 'react'


function Middle_side(){
    const placeh = ['Hello!', 'Hi!', 'Bonjuor!'];
    const [placehState, setPlacehState] = useState(0);
    const {store} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)

    const [showFilter, setShowFilter] = useState(false);

    const handleFilter = () => {
        setShowFilter(!showFilter);
    }

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
    
    const advertisementsToShow = store.publicAdvertisements.length > 0 
        ? store.publicAdvertisements 
        : [];

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
                                    src={ad.images && ad.images.length > 0 ? ad.images[0] : 'default-photo.jpg'} 
                                    alt={ad.title}
                                    className="ad-image"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png?20210118073241';
                                    }}
                                />
                                <div className='info-container'>
                                    <h3 className="ad-title">{ad.title}</h3>
                                    <div className="ad-content">
                                        <div className="price-badge">
                                            {ad.price.toLocaleString('ru-RU')} ₽
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
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Middle_side