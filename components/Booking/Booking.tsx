import { observer } from "mobx-react-lite";
import './Booking.css';
import { Context } from '../../src/main';
import { useContext, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IBookingEntries } from "../models/IBookingEntries";

/** Количество ночей между двумя датами (конец не включён: 1–3 янв = 2 ночи). */
function nightsBetween(start: string, end: string): number {
    const a = new Date(start);
    const b = new Date(end);
    const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}

/** Форматирование даты для отображения (например: 15.01.2025). */
function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const Booking = observer(() => {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);

    /** Список записей бронирования: одна карточка = один период дат. */
    const entries = useMemo(() => store.booking, [store.booking]);

    /** Итог к оплате: сумма по каждой записи (цена за день × количество ночей). */
    const totalSum = useMemo(() => {
        return entries.reduce((sum, entry) => {
            const nights = nightsBetween(entry.startDate, entry.endDate);
            const price = entry.advertisement?.price ?? 0;
            return sum + price * nights;
        }, 0);
    }, [entries]);

    /** Удаление одного периода бронирования (одна карточка). */
    const handleRemoveEntry = async (entryId: number) => {
        if (!confirm('Удалить этот период из бронирования?')) return;
        try {
            await store.removeBookingEntry(entryId);
            alert('Удалено из бронирования');
        } catch (e) {
            console.error('Ошибка удаления:', e);
            alert('Не удалось удалить. Попробуйте ещё раз.');
        }
    };

    useEffect(() => {
        const loadBookingAd = async () => {
            setIsLoading(true);
            try {
                await store.checkAuth();
                if (store.isAuth) {
                    await store.getBookingAdvertisement();
                }
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadBookingAd();
    }, [store.isAuth]);

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
                    <h2 style={{ fontSize: '32px' }}>Требуется авторизация</h2>
                    <p className="string-of-info">Для бронирования необходимо войти в систему</p>
                    <button onClick={() => navigate('/login')} className="login-link">Войти</button>
                </div>
            </div>
        );
    }

    const getImageUrl = (path: string) => `http://localhost:5000${path}`;

    return (
        <div className="main-container">
            <div className="name-container">
                <h1>Бронирование</h1>
            </div>
            <div className="workPlace-container">
                <div className="selectedAd-container">
                    {entries.length === 0 ? (
                        <p className="booking-empty">У вас пока нет бронирований. Выберите квартиру и даты в календаре.</p>
                    ) : (
                        entries.map((entry: IBookingEntries) => {
                            const ad = entry.advertisement;
                            const nights = nightsBetween(entry.startDate, entry.endDate);
                            const periodSum = (ad?.price ?? 0) * nights;
                            return (
                                <div key={entry.id} className="booking-card">
                                    <div className="booking-card-main">
                                        <div className="booking-card-image">
                                            <img
                                                src={ad?.images?.length ? getImageUrl(ad.images[0]) : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png'}
                                                alt={ad?.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NOPHOTO.svg/1024px-NOPHOTO.svg.png';
                                                }}
                                                className="booking-card-imgStyle"
                                            />
                                        </div>
                                        <div className="booking-card-content">
                                            <h3 className="booking-card-title">{ad?.title}</h3>
                                            <div className="booking-card-price">
                                                {(ad?.price ?? 0).toLocaleString('ru-RU')} ₽/день
                                            </div>
                                            <div className="booking-card-period">
                                                <span className="detail-label">Период:</span>
                                                <span className="detail-value">
                                                    {formatDate(entry.startDate)} — {formatDate(entry.endDate)}
                                                    {nights > 0 && ` (${nights} ${nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'})`}
                                                </span>
                                            </div>
                                            <div className="booking-card-details">
                                                <div className="detail-item">
                                                    <span className="detail-label">Город:</span>
                                                    <span className="detail-value">{ad?.city}</span>
                                                </div>
                                                {ad?.street && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Адрес:</span>
                                                        <span className="detail-value">{ad.street}</span>
                                                    </div>
                                                )}
                                                {ad?.countOfRooms != null && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Комнат:</span>
                                                        <span className="detail-value">{ad.countOfRooms}</span>
                                                    </div>
                                                )}
                                                {ad?.id && (
                                                    <div className="articl">
                                                        <span>Артикул:</span>
                                                        <span>{ad.id}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="remove-booking-btn"
                                        onClick={() => handleRemoveEntry(entry.id)}
                                        title="Удалить этот период"
                                    >
                                        ❌
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="costAd-container">
                    <div className="costAd-set">
                        <h2 style={{ marginBottom: '5px' }}>К оплате:</h2>
                        {entries.map((entry: IBookingEntries) => {
                            const ad = entry.advertisement;
                            const nights = nightsBetween(entry.startDate, entry.endDate);
                            const price = ad?.price ?? 0;
                            const lineSum = price * nights;
                            return (
                                <div key={entry.id} className="ad-info">
                                    <p>
                                        {ad?.title}: {formatDate(entry.startDate)} — {formatDate(entry.endDate)}, {nights} н. × {price.toLocaleString('ru-RU')} ₽ = {lineSum.toLocaleString('ru-RU')} ₽
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="costAd-price">
                        <div>
                            <p className="res-word">Итог:</p>
                            <p style={{ fontWeight: 'bold', fontSize: '24px' }}>
                                {totalSum.toLocaleString('ru-RU')} ₽
                            </p>
                        </div>
                        <div className="booking-btn-container">
                            <button className="booking-btn">Бронировать</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Booking;
