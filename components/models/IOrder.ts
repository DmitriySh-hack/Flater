export interface IOrder {
    id: string;
    booking_id: number;
    client_id: string;
    seller_id: string;
    advertisement_id: string;
    price: number;
    move_in_confirmed: boolean | 0 | 1;
    confirmed_at?: string | null;
    created_at?: string;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: IOrder;
}

export interface ConfirmMoveInResponse {
    success: boolean;
    message: string;
}
