import $api from "../http"
import { AxiosResponse } from "axios";
import { IUSER } from "../models/IUser";

export default class UserService{
    static fetchUsers(): Promise<AxiosResponse<IUSER[]>>{
        return $api.get<IUSER[]>('/users')
    }
}