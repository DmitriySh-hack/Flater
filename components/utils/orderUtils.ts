import type { IOrder } from '../models/IOrder';

export function isMoveInConfirmed(value: IOrder['move_in_confirmed']): boolean {
    return value === true || value === 1;
}

export function formatOrderDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
