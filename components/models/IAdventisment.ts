export interface IADVERTISMENT {
    id: string;
    userId: string;
    title: string;
    city: string;
    street: string;
    countOfRooms: number;
    price: number | null;
    images: string[]

    user?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        email: string;
    };
}