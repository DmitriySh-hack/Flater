interface IBookingDates {
    start: string;
    end: string;
}

export function getDaysInMonth(month: number, year: number) {
    const TotalDays = new Date(year, month + 1, 0).getDate();
    let firstDayIndex = new Date(year, month, 1).getDay();

    if (firstDayIndex === 0) {
        firstDayIndex = 6
    } else {
        firstDayIndex = firstDayIndex - 1;
    }

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null)
    }

    for (let j = 1; j <= TotalDays; j++) {
        days.push(new Date(year, month, j))
    }

    return days;
}

export function isDatesBooked(date: Date | null, bookedDates: IBookingDates[]) {
    if (!date) return false;
    const dateStr = formateDate(date);
    return (bookedDates || []).some(range => {
        // Убедимся, что сравниваем строки YYYY-MM-DD
        return dateStr >= range.start && dateStr <= range.end;
    });
}

export function formateDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}