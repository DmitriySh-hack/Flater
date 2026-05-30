import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../src/main';
import OrderService from '../../components/service/OrderService';
import type { IOrder } from '../../components/models/IOrder';
import { formatOrderDate, isMoveInConfirmed } from '../../components/utils/orderUtils';
import '../CRM.css';
import './CRMOrders.css';

export const CRMOrdersPage = observer(function CRMOrdersPage() {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isSuperAdmin = store.isEmployee && store.employee.position === 'super-admin';

    useEffect(() => {
        if (store.isLoading) return;

        if (!store.isEmployee) {
            navigate('/crmsys/auth');
            return;
        }
        if (store.employee.position !== 'super-admin') {
            navigate('/crmsys/main');
        }
    }, [store.isLoading, store.isEmployee, store.employee.position, navigate]);

    useEffect(() => {
        if (store.isLoading || !isSuperAdmin) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await OrderService.getAllOrders();
                setOrders(data);
            } catch (e) {
                console.error(e);
                const status = (e as { response?: { status?: number } }).response?.status;
                if (status === 401 || status === 403) {
                    navigate('/crmsys/auth');
                    return;
                }
                const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail;
                setError(
                    detail
                        ? `Ошибка: ${detail}`
                        : 'Не удалось загрузить сделки. Проверьте, что сервер запущен и таблица orders создана.'
                );
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [store.isLoading, isSuperAdmin, navigate]);

    const handleExport = async () => {
        try {
            const { data } = await OrderService.exportExcel();
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Не удалось скачать Excel');
        }
    };

    if (store.isLoading) {
        return <p>Загрузка...</p>;
    }

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="crm-orders">
            <div className="crm-orders__header">
                <div>
                    <h2 className="crm-orders__title">Все сделки</h2>
                    <p className="crm-orders__subtitle">Панель super-admin: заказы по всем пользователям</p>
                </div>
                <div className="crm-orders__actions">
                    <button type="button" className="crm-orders__btn crm-orders__btn--secondary" onClick={() => navigate('/crmsys/main')}>
                        ← Назад
                    </button>
                    <button type="button" className="crm-orders__btn" onClick={handleExport}>
                        Скачать Excel
                    </button>
                </div>
            </div>

            {loading && <p>Загрузка...</p>}
            {error && <p className="crm-orders__error">{error}</p>}

            {!loading && !error && (
                <div className="crm-orders__table-wrap">
                    <table className="crm-orders__table">
                        <thead>
                            <tr>
                                <th>ID заказа</th>
                                <th>ID клиента</th>
                                <th>ID продавца</th>
                                <th>ID объявления</th>
                                <th>Цена</th>
                                <th>Заселение</th>
                                <th>Создан</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="crm-orders__empty">
                                        Сделок пока нет
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.client_id}</td>
                                        <td>{order.seller_id}</td>
                                        <td>{order.advertisement_id}</td>
                                        <td>{Number(order.price).toLocaleString('ru-RU')} ₽</td>
                                        <td>
                                            <span
                                                className={
                                                    isMoveInConfirmed(order.move_in_confirmed)
                                                        ? 'crm-orders__badge crm-orders__badge--yes'
                                                        : 'crm-orders__badge crm-orders__badge--no'
                                                }
                                            >
                                                {isMoveInConfirmed(order.move_in_confirmed) ? 'Да' : 'Нет'}
                                            </span>
                                        </td>
                                        <td>{formatOrderDate(order.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});
