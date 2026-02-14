import React from 'react';
import './Calendar.css';

interface ICalendarDayProps {
    date: Date | null;
    isBooked: boolean;
    isSelected: boolean;
    isInRange: boolean;
    isPast: boolean;
    isRangeStart?: boolean;
    isRangeEnd?: boolean;
    onClick: (date: Date) => void;
}

const CalendarDay: React.FC<ICalendarDayProps> = ({
    date,
    isBooked,
    isSelected,
    isInRange,
    isPast,
    isRangeStart,
    isRangeEnd,
    onClick
}) => {
    // Если даты нет (пустая ячейка для выравнивания сетки)
    if (!date) {
        return <div className="calendar-day-empty" />;
    }

    const isDisabled = isBooked || isPast;

    // Собираем классы вручную для простоты (можно использовать библиотеку classnames)
    const classes = [
        'calendar-day',
        isBooked ? 'booked' : '',
        isPast ? 'disabled' : '',
        isSelected ? 'selected' : '',
        isInRange ? 'in-range' : '',
        isRangeStart ? 'range-start' : '',
        isRangeEnd ? 'range-end' : ''
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (!isDisabled) {
            onClick(date);
        }
    };

    return (
        <div
            className={classes}
            onClick={handleClick}
            title={isBooked ? "Дата уже занята" : isPast ? "Нельзя выбрать дату в прошлом" : ""}
        >
            {date.getDate()}
        </div>
    );
};

export default CalendarDay;