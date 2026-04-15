import { makeAutoObservable, runInAction } from "mobx";
import type { IUSER } from "../models/IUser";
import AuthService from "../service/AuthService";
import $api from "../http";
import type { AuthResponse } from "../models/response/AuthResponse";
import UserService from "../service/UserService";
import type { IADVERTISMENT } from "../models/IAdventisment";
import type { IBookingEntries } from '../models/IBookingEntries';
import type { IEmployee } from "../models/IEmployee";

interface AdvertismentState {
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

    bookingMap = new Map<number, IBookingEntries>();

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

    booking: IBookingEntries[] = [];
    bookingLoading = false;
    bookingError: string | null = null;
    bookingStatus: Record<string, boolean> = {}

    setSelectedAd(ad: IADVERTISMENT) {
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

    //Избранное
    setFavorites(favorites: IADVERTISMENT[]) {
        this.favorites = favorites;
    }

    setFavoritesLoading(loading: boolean) {
        this.favoritesLoading = loading
    }

    setFavoritesError(error: string | null) {
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

    setBooking(booking: IBookingEntries[]) {
        this.booking = booking;
        this.bookingMap.clear();
        booking.forEach(entry => {
            if (entry.id != null) this.bookingMap.set(entry.id, entry);
        });
    }

    setBookingLoading(loading: boolean) {
        this.bookingLoading = loading
    }

    setBookingError(error: string | null) {
        this.bookingError = error
    }

    setBookingStatuses(statuses: Record<string, boolean>) {
        this.bookingStatus = statuses;
    }

    updateBookingStatus(advertisementId: string, isBooking: boolean) {
        this.bookingStatus[advertisementId] = isBooking
    }

    isAdvertisementBooking(advertisementId: string): boolean {
        return this.bookingStatus[advertisementId] || false
    }

    //CRM
    employee = {} as IEmployee
    isEmployee = false;

    setEmployee(employee: IEmployee){
        return this.employee = employee;
    }

    setEmployeeAuth(value: boolean){
        this.isEmployee = value;
    }

    constructor() {
        makeAutoObservable(this);
        this.initializeAuth();
    }

    setAuth(bool: boolean) {
        this.isAuth = bool
    }

    setUser(user: IUSER) {
        this.user = user;
    }

    setAdvertisment(ads: IADVERTISMENT[]) {
        this.advertisment.advertisments = ads;
    }

    addAdvertisment(ad: IADVERTISMENT) {
        this.advertisment.advertisments.unshift(ad);
    }

    removeAdvertisment(adId: string) {
        this.advertisment.advertisments = this.advertisment.advertisments.filter(ad => ad.id !== adId)
    }

    setAdvertisementError(e: string | null) {
        this.advertisment.error = e;
    }

    setCities(cities: string[]) {
        this.cities = cities;
    }

    get userAdvertisment() {
        return this.advertisment.advertisments;
    }

    get advertismentError() {
        return this.advertisment.error;
    }

    private getTokenRole(token: string): string | null {
        try {
            const base64Payload = token.split('.')[1];
            if (!base64Payload) return null;
            const payloadJson = atob(base64Payload);
            const payload = JSON.parse(payloadJson) as { role?: string };
            return payload.role ?? null;
        } catch {
            return null;
        }
    }

    async initializeAuth() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const tokenRole = this.getTokenRole(token);
                if (tokenRole === 'employee') {
                    await this.checkEmployeeAuth();
                } else {
                    await this.checkAuth();
                }
            }
        } catch (error) {
            console.log('Ошибка инициализации аутентификации', error);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async login(email: string, password: string) {
        try {
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

    async registration(email: string, password: string, firstName: string, lastName: string) {
        try {
            const response = await AuthService.registration(email, password, firstName, lastName);
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true);
            this.setUser(response.data.user)
        } catch (e) {
            console.log('Ошибка регистрации:', e);
        }
    }

    async logout() {
        try {
            await AuthService.logout();
        } catch (e) {
            console.log('Ошибка выхода:', e);
        } finally {
            runInAction(() => {
                localStorage.removeItem('token');
                this.setAuth(false);
                this.setUser({} as IUSER);
                this.setAdvertisment([]);
                this.setFavorites([]);
                this.setFavoriteStatuses({});
                this.bookingMap.clear();
                this.setBooking([]);
            });
        }
    }

    async checkAuth() {
        console.log('🔄 [Store] checkAuth called');
        console.log('📝 LocalStorage token:', localStorage.getItem('token'));

        try {
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

    async checkEmployeeAuth() {
        try {
            const response = await $api.get('/employee/refresh');
            localStorage.setItem('token', response.data.accessToken);
            this.setEmployee(response.data.user);
            this.setEmployeeAuth(true);
        } catch (e) {
            localStorage.removeItem('token');
            this.setEmployee({ id: '', name: '', nickname: '', position: '' });
            this.setEmployeeAuth(false);
            throw e;
        }
    }

    async updateProfile(update: Partial<Pick<IUSER, 'firstName' | 'lastName' | 'email'>>) {
        try {
            const response = await UserService.updateProfile(update)
            this.setUser(response.data.user)
            return response.data.user
        } catch (e) {
            console.log('Ошибка обновления профиля:', e);
            throw e;
        }
    }

    async changePassword(oldPassword: string, newPassword: string) {
        try {
            const response = await UserService.changePassword({ oldPassword, newPassword })
            return response.data.success
        } catch (e) {
            console.log('Ошибка смены пароля:', e);
            throw e;
        }
    }

    async uploadAvatar(file: File) {
        try {
            const formData = new FormData();
            formData.append('avatar', file)
            const response = await UserService.uploadAvatar(formData);
            this.setUser(response.data.user)
            return response.data.user
        } catch (e) {
            console.log('Ошибка загрузки аватара:', e);
            throw e;
        }
    }

    async createAdvertisment(adData: Omit<IADVERTISMENT, 'id' | 'userId'>) {
        try {
            const response = await $api.post(`/advertisements`, adData);
            this.addAdvertisment(response.data)
            return response.data;
        } catch (e: unknown) {
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

    async getUserAdvertisments() {
        if (!this.isAuth) return;

        try {
            const response = await $api.get(`/advertisements`);
            this.setAdvertisment(response.data)
            return response.data
        } catch (e: unknown) {
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

    async updateAdvertisment(adId: string, updateData: Partial<IADVERTISMENT>) {
        try {
            const response = await $api.put(`/advertisements/${adId}`, updateData);
            const updateAds = this.advertisment.advertisments.map(ad => ad.id === adId ? { ...ad, ...updateData } : ad);
            this.setAdvertisment(updateAds)
            return response.data
        } catch (e: unknown) {
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

    async deleteAdvertisment(adId: string) {
        try {
            await $api.delete(`/advertisements/${adId}`);
            this.removeAdvertisment(adId)
            return true;
        } catch (e: unknown) {
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

    async getAllAdvertisments() {
        this.setPublicAdsLoading(true);
        this.setPublicAdsError(null);

        try {
            const response = await fetch('http://localhost:5000/api/advertisements/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.setPublicAdvertisements(data);
            return data;
        } catch (e: unknown) {
            let errorMessage = 'Ошибка загрузки объявлений';

            if (e instanceof Error) {
                errorMessage = e.message;
            }

            this.setPublicAdsError(errorMessage);
            console.log('Ошибка загрузки публичных объявлений:', e);
            throw e;
        } finally {
            this.setPublicAdsLoading(false);
        }
    }

    async addFavorite(advertisementId: string) {
        if (!this.isAuth) {
            throw new Error('Необходимо авторизироваться')
        }

        try {
            console.log('Отправка запроса на добавление в избранное:', advertisementId);
            const response = await $api.post(`/favorites`, { advertisementId });
            console.log('Ответ сервера:', response.data);
            this.updateFavoriteStatus(advertisementId, true)
            const ad = this.publicAdvertisements.find(a => a.id == advertisementId)
            if (ad && !this.favorites.some(f => f.id === advertisementId)) {
                this.favorites.push(ad)
            }
            return response.data
        } catch (e: unknown) {
            const axiosError = e as AxiosError;
            console.error('Полная ошибка Axios:', axiosError);
            console.error('Response data:', axiosError.response?.data);
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при добавлении в избранное';
            console.error('Ошибка добавления в избранное:', e);
            throw new Error(errorMessage);
        }
    }

    async removeFavorite(advertisementId: string) {
        if (!this.isAuth) {
            throw new Error('Необходимо авторизироваться')
        }

        try {
            const response = await $api.delete(`/favorites/${advertisementId}`)
            this.updateFavoriteStatus(advertisementId, false)
            this.favorites = this.favorites.filter(f => f.id !== advertisementId)
            return response.data
        } catch (e: unknown) {
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

    /** Загружает список бронирований с датами (записи из booking_dates). Одна запись = один период. */
    async getBookingAdvertisement() {
        if (!this.isAuth) {
            return [];
        }

        this.setBookingLoading(true);
        this.setBookingError(null);

        try {
            const response = await $api.get<IBookingEntries[]>('/booking/entries');
            this.setBooking(response.data);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при загрузке бронирований';
            this.setBookingError(errorMessage);
            console.error('Ошибка загрузки бронирований:', error);
            throw error;
        } finally {
            this.setBookingLoading(false);
        }
    }

    /** Статус «забронировано»: у пользователя есть хотя бы один период по этому объявлению. */
    async loadBookingStatus() {
        try {
            const entries = await this.getBookingAdvertisement() as IBookingEntries[];
            const validEntries = entries.filter(
                (e): e is IBookingEntries => e && typeof e.advertisementId === 'string'
            );
            const bookedAdIds = new Set(validEntries.map(e => e.advertisementId));

            const statuses: Record<string, boolean> = {};
            this.publicAdvertisements.forEach(ad => {
                if (ad?.id) statuses[ad.id] = bookedAdIds.has(ad.id);
            });
            this.setBookingStatuses(statuses);
        } catch (error) {
            console.error('Ошибка загрузки статусов бронированных:', error);
        }
    }

    /** Добавляет связь в booking_advertisement; список периодов обновляется перезапросом с сервера. */
    async addBooking(advertisementId: string) {
        if (!this.isAuth) {
            throw new Error('Необходимо авторизироваться');
        }

        try {
            const response = await $api.post(`/booking`, { advertisementId });
            this.updateBookingStatus(advertisementId, true);
            await this.getBookingAdvertisement();
            return response.data;
        } catch (e: unknown) {
            const axiosError = e as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при бронировании';
            console.error('Ошибка при бронировании:', e);
            throw new Error(errorMessage);
        }
    }


    /** Удаляет все периоды бронирования по этой квартире (кнопка «Удалить бронь» на карточке объявления). */
    async removeBooking(advertisementId: string) {
        if (!this.isAuth) {
            throw new Error('Необходимо авторизироваться');
        }

        try {
            await $api.delete(`/booking/${advertisementId}`);
            await $api.delete(`/calendar/${advertisementId}`);

            runInAction(() => {
                this.updateBookingStatus(advertisementId, false);
                this.booking = this.booking.filter(e => e.advertisementId !== advertisementId);
                this.bookingMap.clear();
                this.booking.forEach(entry => this.bookingMap.set(entry.id, entry));
            });
            return { message: 'Успешно удалено' };
        } catch (e: unknown) {
            const axiosError = e as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при удалении брони';
            console.error('Ошибка удаления брони:', e);
            throw new Error(errorMessage);
        }
    }

    /** Удаляет один период бронирования по id записи в booking_dates (кнопка на карточке во вкладке «Бронирование»). */
    async removeBookingEntry(bookingDateId: number) {
        if (!this.isAuth) {
            throw new Error('Необходимо авторизироваться');
        }

        try {
            await $api.delete(`/calendar/booking/${bookingDateId}`);
            runInAction(() => {
                const entry = this.booking.find(e => e.id === bookingDateId);
                this.booking = this.booking.filter(e => e.id !== bookingDateId);
                this.bookingMap.delete(bookingDateId);
                if (entry?.advertisementId) {
                    const stillBooked = this.booking.some(e => e.advertisementId === entry.advertisementId);
                    this.updateBookingStatus(entry.advertisementId, stillBooked);
                }
            });
            return { message: 'Успешно удалено' };
        } catch (e: unknown) {
            const axiosError = e as AxiosError;
            const errorMessage = axiosError.response?.data?.message || 'Ошибка при удалении брони';
            console.error('Ошибка удаления брони:', e);
            throw new Error(errorMessage);
        }
    }

    async toggleBooking(advertisementId: string) {
        const isFavorite = this.isAdvertisementBooking(advertisementId);

        if (isFavorite) {
            return await this.removeBooking(advertisementId);
        } else {
            return await this.addBooking(advertisementId);
        }
    }

    //CRM
    async loginEmployee(nickname: string, password: string){
        runInAction(() => { this.isLoading = true; });
        try {
            const response = await $api.post('/employee/login', {nickname, password});
            localStorage.setItem('token', response.data.accessToken)
            this.setEmployee(response.data.user)
            this.setEmployeeAuth(true)
            return { ok: true };

        } catch (e) {
            console.log('Ошибка входа:', e);
            const axiosError = e as AxiosError;
            const message = axiosError.response?.data?.message || 'Ошибка входа сотрудника';
            return { ok: false, message };
        } finally {
            runInAction(() => { this.isLoading = false; });
        }
    }

    async registrationEmployee(nickname: string, password: string, position: string, name: string){
        try{
            const response = await $api.post('/employee/registration', { nickname, password, position, name})
            localStorage.setItem('token', response.data.accessToken)
            this.setEmployee(response.data.user)
            this.setEmployeeAuth(true)
        }catch(e){
            console.log('Ошибка регистрации:', e)
        }
    }

    async logoutEmployee(){
        try{
            await $api.post('/employee/logout')
        }catch(e){
            console.log('Ошибка выхода:', e)
        } finally {
            localStorage.removeItem('token');
            this.setEmployee({ id: '', name: '', nickname: '', position: '' });
            this.setEmployeeAuth(false);
        }
    }
}

