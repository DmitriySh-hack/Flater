import React, { useContext } from 'react';
import { Modal } from '../Profile/ModalPagePassword/Modal';
import Calendar from './Calendar';
import { Context } from '../../src/main';

interface ModalCalendarProps {
    isOpen: boolean;
    isClose: () => void;
    adId: string | null;
}

export const ModalCalendar: React.FC<ModalCalendarProps> = ({ isOpen, isClose, adId }) => {
    const { store } = useContext(Context) as any;

    const handleSuccess = async () => {
        if (adId) {
            try {
                // При успешном бронировании в календаре также добавляем в общий список бронирования
                await store.addBooking(adId);
                isClose();
            } catch (e) {
                console.error("Ошибка при обновлении статуса бронирования:", e);
                isClose();
            }
        }
    };

    if (!adId) return null;

    return (
        <Modal isOpen={isOpen} isClose={isClose}>
            <div style={{ padding: '10px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>Выбор дат бронирования</h2>
                <Calendar adId={adId} onSuccess={handleSuccess} />
            </div>
        </Modal>
    );
};
