import $api from '../http';
import type { AxiosResponse } from 'axios';
import type { ConfirmMoveInResponse, CreateOrderResponse, IOrder } from '../models/IOrder';

export default class OrderService {
    static createOrder(bookingId: number): Promise<AxiosResponse<CreateOrderResponse>> {
        return $api.post<CreateOrderResponse>('/orders', { bookingId });
    }

    static getMyOrders(): Promise<AxiosResponse<IOrder[]>> {
        return $api.get<IOrder[]>('/orders/my');
    }

    /** Все сделки — только super-admin (CRM) */
    static getAllOrders(): Promise<AxiosResponse<IOrder[]>> {
        return $api.get<IOrder[]>('/orders/all');
    }

    static confirmMoveIn(orderId: string): Promise<AxiosResponse<ConfirmMoveInResponse>> {
        return $api.put<ConfirmMoveInResponse>(`/orders/${orderId}/confirm-move-in`);
    }

    static hideFromProfile(orderId: string): Promise<AxiosResponse<{ success: boolean; message: string }>> {
        return $api.patch<{ success: boolean; message: string }>(`/orders/${orderId}/hide-from-profile`);
    }

    static exportExcel(): Promise<AxiosResponse<Blob>> {
        return $api.get('/orders/export', { responseType: 'blob' });
    }
}
