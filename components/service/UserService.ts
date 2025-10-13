import $api from "../http"
import { AxiosResponse } from "axios";
import { IUSER } from "../models/IUser";

export default class UserService{
    static fetchUsers(): Promise<AxiosResponse<IUSER[]>>{
        return $api.get<IUSER[]>('/users')
    }

    static updateProfile(payload: Partial<Pick<IUSER, 'firstName' | 'lastName' | 'email'>>): Promise<AxiosResponse<{ user: IUSER }>>{
        return $api.put<{ user: IUSER }>('/profile', payload);
    }

    static changePassword(payload: {oldPassword: string, newPassword: string}) : Promise<AxiosResponse<{success: boolean}>>{
        return $api.put<{success: boolean}>('/change-password', payload)
    }
}