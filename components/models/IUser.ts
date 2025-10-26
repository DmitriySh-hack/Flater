export interface IUSER {
    email: string;
    isActivated: boolean;
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?:string;
}