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

    cities: string[] = [];

    advertisment: AdvertismentState = {
        advertisments: [],
        error: null,
    }

    selectedAdvertisement: IADVERTISMENT | null = null

    publicAdvertisements: IADVERTISMENT[] = [];
    publicAdsLoading = false;
    publicAdsError: string | null = null;
    
    favorites: IADVERTISMENT[] = [];
    favoritesLoading = false;
    favoritesError: string | null = null;
    favoriteStatuses: Record<string, boolean> = {};

    setSelectedAd(ad: IADVERTISMENT){
        this.selectedAdvertisement = ad;
    }

    setPublicAdvertisements(ads: IADVERTISMENT[]) {
        this.publicAdvertisements = ads;
    }

    setPublicAdsLoading(loading: boolean) {
        this.publicAdsLoading = loading;
    }

    setPublicAdsError(error: string | null) {
        this.publicAdsError = error;
    }


    setFavorites(favorites: IADVERTISMENT[]) {
        this.favorites = favorites;
    }

    setFavoritesLoading(loading: boolean){
        this.favoritesLoading = loading
    }

    setFavoritesError(error: string | null){
        this.favoritesError = error
    }

    updateFavoriteStatus(advertisementId: string, isFavorite: boolean) {
        this.favoriteStatuses[advertisementId] = isFavorite;
    }

    isAdvertisementFavorite(advertisementId: string): boolean {
        return this.favoriteStatuses[advertisementId] || false;
    }

    setFavoriteStatuses(statuses: Record<string, boolean>) {
        this.favoriteStatuses = statuses;
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

    setCities(cities: string[]) {
        this.cities = cities;
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
            await this.getFavorites();

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
            this.setFavorites([]);
            this.setFavoriteStatuses({});

        } catch (e) {
            console.log('Ошибка выхода:', e);
        }
    }

    async checkAuth(){
        console.log('🔄 [Store] checkAuth called');
        console.log('📝 LocalStorage token:', localStorage.getItem('token'));
        
        try{
            console.log('📤 Sending request to /refresh...');
            const response = await $api.get<AuthResponse>(`/refresh`);
            
            console.log('✅ Response received, status:', response.status);
            console.log('👤 User data:', response.data.user);
            console.log('🔑 New access token:', response.data.accessToken.substring(0, 20) + '...');
            
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user);

            console.log('📥 Loading user advertisements...');
            await this.getUserAdvertisments();
            
            console.log('📥 Loading favorites...');
            await this.getFavorites();
            
            console.log('✅ Auth check completed successfully');
            
        } catch (e: unknown) {
            console.error('❌ Error in checkAuth:');
            
            if (e && typeof e === 'object' && 'response' in e) {
                const axiosError = e as { 
                    response?: { 
                        status?: number; 
                        data?: { message?: string } 
                    }; 
                    message?: string 
                };
                
                console.error('Status:', axiosError.response?.status);
                console.error('Message:', axiosError.response?.data?.message || axiosError.message || 'Unknown error');
            } else if (e instanceof Error) {
                console.error('Error:', e.message);
            } else {
                console.error('Unknown error:', e);
            }
            
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUSER);
            this.setFavorites([]);
            this.setAdvertisment([]);
            
            throw e;
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

    async createAdvertismentWithImages(
        title: string,
        price: number | null,
        city: string,
        street: string,
        countOfRooms: number,
        images?: File[]
    ) {
        try {
            const formData = new FormData();
            
            // Добавляем текстовые данные
            formData.append('title', title);
            formData.append('price', price?.toString() || '');
            formData.append('city', city);
            formData.append('street', street);
            formData.append('countOfRooms', countOfRooms.toString());
            
            // Добавляем файлы (как для аватара)
            if (images && images.length > 0) {
                images.forEach((file) => {
                    formData.append('images', file); // 'images' вместо 'avatar'
                });
            }
            
            // Используем ту же логику, что и для uploadAvatar
            const response = await $api.post(`/advertisements`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            this.addAdvertisment(response.data);
            return response.data;
            
        } catch (e: unknown) {
            let errorMessage = 'Ошибка при создании объявления';
            const axiosError = e as AxiosError;
            
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
                console.log(axiosError.response.data.message);
            } else {
                console.log('Ошибка создания объявления:', e);
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

    async getAllAdvertisments(){
        this.setPublicAdsLoading(true);
        this.setPublicAdsError(null);

        try{
            const response = await fetch('http://localhost:5000/api/advertisements/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.setPublicAdvertisements(data);
            return data;
        }catch(e: unknown){
            let errorMessage = 'Ошибка загрузки объявлений';

            if (e instanceof Error) {
                errorMessage = e.message;
            }

            this.setPublicAdsError(errorMessage);
            console.log('Ошибка загрузки публичных объявлений:', e);
            throw e;
        }finally{
            this.setPublicAdsLoading(false);
        }
    }

    async addFavorite(advertisementId: string){
        if(!this.isAuth){
            throw new Error('Необходимо авторизироваться')
        }

        try{
            console.log('Отправка запроса на добавление в избранное:', advertisementId);
            const response = await $api.post(`/favorites`, { advertisementId });
            console.log('Ответ сервера:', response.data);
            this.updateFavoriteStatus(advertisementId, true)
            const ad = this.publicAdvertisements.find(a => a.id == advertisementId)
            if(ad && !this.favorites.some(f => f.id === advertisementId)){
                this.favorites.push(ad)
            }
            return response.data
        }catch(e: unknown){
            const axiosError = e as AxiosError;
            console.error('Полная ошибка Axios:', axiosError);
            console.error('Response data:', axiosError.response?.data);
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при добавлении в избранное';
            console.error('Ошибка добавления в избранное:', e);
            throw new Error(errorMessage);
        }
    }

    async removeFavorite(advertisementId: string){
        if(!this.isAuth){
            throw new Error('Необходимо авторизироваться')
        }

        try{
            const response = await $api.delete(`/favorites/${advertisementId}`)
            this.updateFavoriteStatus(advertisementId, false)
            this.favorites = this.favorites.filter(f => f.id !== advertisementId)
            return response.data
        }catch(e: unknown){
            const axiosError = e as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при удалении из избранное';
            console.error('Ошибка удаления из избранного:', e);
            throw new Error(errorMessage);
        }
    }

    async toggleFavorite(advertisementId: string) {
        const isFavorite = this.isAdvertisementFavorite(advertisementId);
        
        if (isFavorite) {
            return await this.removeFavorite(advertisementId);
        } else {
            return await this.addFavorite(advertisementId);
        }
    }

    async getFavorites() {
        if (!this.isAuth) {
            return [];
        }

        this.setFavoritesLoading(true);
        this.setFavoritesError(null);

        try {
            const response = await $api.get(`/favorites`);
            this.setFavorites(response.data);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при загрузке избранного';
            this.setFavoritesError(errorMessage);
            console.error('Ошибка загрузки избранного:', error);
            throw error;
        } finally {
            this.setFavoritesLoading(false);
        }
    }

    async loadFavoriteStatuses() {
        if (!this.isAuth || this.publicAdvertisements.length === 0) {
            return;
        }

        try {
            const statuses: Record<string, boolean> = {};
            
            const favorites = await this.getFavorites();

            const validFavorites = favorites.filter((f: IADVERTISMENT | null) => 
                f && f.id && typeof f.id === 'string'
            );
            
            const favoriteIds = new Set(validFavorites.map((f: IADVERTISMENT) => f.id));
            
            this.publicAdvertisements.forEach(ad => {
                if (ad && ad.id) {
                    statuses[ad.id] = favoriteIds.has(ad.id);
                }
            });
            
            this.setFavoriteStatuses(statuses);
        } catch (error) {
            console.error('Ошибка загрузки статусов избранного:', error);
        }
    }

    async getAllCities() {
        try {
            const response = await $api.get(`/advertisements/all-cities`);
            this.setCities(response.data);
            return response.data;
        } catch (e: unknown) {
            const axiosError = e as AxiosError;
            const errorMessage =
                axiosError.response?.data?.message || "Ошибка получения списка городов";
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}