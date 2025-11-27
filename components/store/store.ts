import { makeAutoObservable } from "mobx";
import type { IUSER } from "../models/IUser";
import AuthService from "../service/AuthService";
import $api from "../http";
import type { AuthResponse } from "../models/response/AuthResponse";
import UserService from "../service/UserService";
import type { IADVERTISMENT } from "../models/IAdventisment";

interface AdvertismentState{
    advertisments: IADVERTISMENT[],//Массив объявлений
    error: string | null;
}

interface AxiosError {
    response?: {
        data?: {
            message: string;
        };
    };
}

export default class Store {
    user = {} as IUSER
    isAuth = false;
    isLoading = true;

    advertisment: AdvertismentState = {
        advertisments: [],
        error: null,
    }
    
    constructor() {
        makeAutoObservable(this);
        this.initializeAuth();
    }

    setAuth(bool: boolean){
        this.isAuth = bool
    }

    setUser(user: IUSER){
        this.user = user;
    }

    setAdvertisment(ads: IADVERTISMENT[]){
        this.advertisment.advertisments = ads;
    }

    addAdvertisment(ad: IADVERTISMENT){
        this.advertisment.advertisments.unshift(ad);
    }

    removeAdvertisment(adId: string){
        this.advertisment.advertisments = this.advertisment.advertisments.filter(ad => ad.id !== adId)
    }

    setAdvertisementError(e: string | null){
        this.advertisment.error = e;
    }

    get userAdvertisment(){
        return this.advertisment.advertisments;
    }

    get advertismentError(){
        return this.advertisment.error;
    }

    async initializeAuth() {
        try{
             const token = localStorage.getItem('token');
            if (token) {
                await this.checkAuth();
            }
        }catch(error){
            console.log('Ошибка инициализации аутентификации', error);
        }
    }

    async login(email: string, password: string){
        try{
            const response = await AuthService.login(email, password);
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)

            await this.getUserAdvertisments();

        } catch (e) {
            console.log('Ошибка входа:', e);
        }
    }

    async registration(email: string, password: string, firstName: string, lastName: string){
        try{
            const response = await AuthService.registration(email, password, firstName, lastName);
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)
        } catch (e) {
            console.log('Ошибка регистрации:', e);
        }
    }

    async logout(){
        try{
            await AuthService.logout();
            localStorage.removeItem('token')
            this.setAuth(false);
            this.setUser({} as IUSER);

            this.setAdvertisment([]);

        } catch (e) {
            console.log('Ошибка выхода:', e);
        }
    }

    async checkAuth(){
        try{
            const response = await $api.get<AuthResponse>(`/refresh`);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)

            await this.getUserAdvertisments();
        } catch (e) {
            console.log('Ошибка проверки аутентификации:', e);
        }
    }

    async updateProfile(update: Partial<Pick<IUSER, 'firstName' | 'lastName' | 'email'>>){
        try{
            const response = await UserService.updateProfile(update)
            this.setUser(response.data.user)
            return response.data.user
        }catch(e){
            console.log('Ошибка обновления профиля:', e);
            throw e;
        }
    }

    async changePassword(oldPassword: string, newPassword: string){
        try{
            const response = await UserService.changePassword({oldPassword, newPassword})
            return response.data.success
        }catch(e){
            console.log('Ошибка смены пароля:', e);
            throw e;
        }
    }

    async uploadAvatar(file: File){
        try{
            const formData = new FormData();
            formData.append('avatar', file)
            const response = await UserService.uploadAvatar(formData);
            this.setUser(response.data.user)
            return response.data.user
        }catch(e){
            console.log('Ошибка загрузки аватара:', e);
            throw e;
        }
    }

    async createAdvertisment(adData: Omit<IADVERTISMENT, 'id' | 'userId'>){
        try{
            const response = await $api.post(`/advertisements`, adData);
            this.addAdvertisment(response.data)
            return response.data;
        }catch(e: unknown){
            let errorMessage = 'Ошибка при загрузке объявлений';
            const axiosError = e as AxiosError;
            
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
                console.log(axiosError.response.data.message);
            } else {
                console.log('Ошибка загрузки объявлений:', e);
            }
            
            this.setAdvertisementError(errorMessage);
            throw e;
        }
    }

    async getUserAdvertisments(){
        if (!this.isAuth) return;

        try{
            const response = await $api.get(`/advertisements`);
            this.setAdvertisment(response.data)
            return response.data
        }catch(e: unknown){
            let errorMessage = 'Ошибка получения количества объявлений'
            const axiosError = e as AxiosError;

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
                console.log(axiosError.response.data.message);
            } else {
                console.log('Ошибка загрузки объявлений:', e);
            }
            
            this.setAdvertisementError(errorMessage);
            throw e;
        }
    }

    async updateAdvertisment(adId: string, updateData: Partial<IADVERTISMENT>){
        try{
            const response = await $api.put(`/advertisements/${adId}`, updateData);
            const updateAds = this.advertisment.advertisments.map(ad => ad.id === adId ? {...ad, ...updateData} : ad);
            this.setAdvertisment(updateAds)
            return response.data
        }catch(e: unknown){
            let errorMessage = 'Ошибка получения количества объявлений'
            const axiosError = e as AxiosError;

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
                console.log(axiosError.response.data.message);
            } else {
                console.log('Ошибка загрузки объявлений:', e);
            }
            
            this.setAdvertisementError(errorMessage);
            throw e;
            
        }
    }

    async deleteAdvertisment(adId: string){
        try{
            await $api.delete(`/advertisements/${adId}`);
            this.removeAdvertisment(adId)
            return true;
        }catch(e: unknown){
             let errorMessage = 'Ошибка при загрузке объявлений';
             const axiosError = e as AxiosError;
            
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
                console.log(axiosError.response.data.message);
            } else {
                console.log('Ошибка загрузки объявлений:', e);
            }
                        
            this.setAdvertisementError(errorMessage);
            throw e;
        }
    }
}