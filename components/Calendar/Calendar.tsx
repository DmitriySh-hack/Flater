import React, { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import BookingStore from "../store/BookingStore";
import CalendarDay from "./CalendarDay";
import { getDaysInMonth, isDatesBooked, formateDate } from "./utils/date-utils";
import './Calendar.css';

interface ICalendarProps {
    adId: string;
    onSuccess?: () => void;
}

const Calendar: React.FC<ICalendarProps> = observer(({ adId, onSuccess }) => {
    // Текущий видимый месяц
    const [viewDate, setViewDate] = useState(new Date());

    // Выбранный диапазон
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Подгружаем занятые даты при первом рендере
    useEffect(() => {
        if (adId) {
            BookingStore.fetchBookingDates(adId);
        }
    }, [adId]);

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const days = getDaysInMonth(month, year);

    // Навигация
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleDayClick = (date: Date) => {
        if ((startDate && endDate) || !startDate) {
            setStartDate(date);
            setEndDate(null);
        } else {
            if (date < startDate) {
                setStartDate(date);
            } else if (formateDate(date) === formateDate(startDate)) {
                setStartDate(null);
            } else {
                const hasBookingInside = BookingStore.bookedDates.some(range => {
                    const dStr = formateDate(date);
                    const sStr = formateDate(startDate);
                    return range.start > sStr && range.start < dStr;
                });

                if (hasBookingInside) {
                    alert("Внутри выбранного диапазона есть занятые даты!");
                    return;
                }
                setEndDate(date);
            }
        }
    };

    const handleReserve = async () => {
        if (!startDate || !endDate) return;
        try {
            await BookingStore.reserve(
                adId,
                formateDate(startDate),
                formateDate(endDate)
            );
            alert("Успешно забронировано!");
            if (onSuccess) onSuccess();
            setStartDate(null);
            setEndDate(null);
        } catch (e) {
            console.log(e)
            alert("Ошибка при бронировании");
        }
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="nav-btn" onClick={prevMonth}>&lt;</button>
                <span className="month-name">
                    {viewDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </span>
                <button className="nav-btn" onClick={nextMonth}>&gt;</button>
            </div>

            <div className="calendar-grid">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="calendar-weekday">{d}</div>
                ))}

                {days.map((date, index) => {
                    const isSelected = !!date && !!(
                        (startDate && formateDate(date) === formateDate(startDate)) ||
                        (endDate && formateDate(date) === formateDate(endDate))
                    );

                    const isInRange = !!date && !!startDate && !!endDate &&
                        date > startDate && date < endDate;

                    const isPast = !!date && date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                        <CalendarDay
                            key={date ? date.toISOString() : `empty-${index}`}
                            date={date}
                            isBooked={!!(date && isDatesBooked(date, BookingStore.bookedDates))}
                            isSelected={isSelected}
                            isInRange={isInRange}
                            isPast={isPast}
                            isRangeStart={!!(date && startDate && formateDate(date) === formateDate(startDate))}
                            isRangeEnd={!!(date && endDate && formateDate(date) === formateDate(endDate))}
                            onClick={handleDayClick}
                        />
                    );
                })}
            </div>

            <div className="calendar-footer">
                <div className="selection-info">
                    {startDate && !endDate && <span>Выберите дату</span>}
                    {startDate && endDate && (
                        <span>
                            {formateDate(startDate)} — {formateDate(endDate)}
                        </span>
                    )}
                </div>
                <button
                    className="reserve-button"
                    disabled={!startDate || !endDate || BookingStore.calendarLoading}
                    onClick={handleReserve}
                >
                    {BookingStore.calendarLoading ? 'Загрузка...' : 'Забронировать'}
                </button>
            </div>
        </div>
    );
});

export default Calendar;