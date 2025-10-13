import { makeAutoObservable } from "mobx";
import type { IUSER } from "../models/IUser";
import AuthService from "../service/AuthService";
import axios from "axios";
import type { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";
import UserService from "../service/UserService";


export default class Store {
    user = {} as IUSER
    isAuth = false;
    
    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean){
        this.isAuth = bool
    }

    setUser(user: IUSER){
        this.user = user;
    }

    async login(email: string, password: string){
        try{
            const response = await AuthService.login(email, password);
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
        }
    }

    async registration(email: string, password: string, firstName: string, lastName: string){
        try{
            const response = await AuthService.registration(email, password, firstName, lastName);
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
        }
    }

    async logout(){
        try{
            await AuthService.logout();
            localStorage.removeItem('token')
            this.setAuth(false);
            this.setUser({} as IUSER);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
        }
    }

    async checkAuth(){
        try{
            const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {withCredentials: true});
            console.log(response)
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
        }
    }

    async updateProfile(update: Partial<Pick<IUSER, 'firstName' | 'lastName' | 'email'>>){
        try{
            const response = await UserService.updateProfile(update)
            this.setUser(response.data.user)
            return response.data.user
        }catch(e: unknown){
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
            throw e;
        }
    }

    async changePassword(oldPassword: string, newPassword: string){
        try{
            const response = await UserService.changePassword({oldPassword, newPassword})
            return response.data.success
        }catch(e: unknown){
            if (axios.isAxiosError(e)) {
                console.log(e.response?.data?.message);
            } else {
                console.log('Ошибка');
            }
            throw e;
        }
    }
}