import { makeAutoObservable, runInAction } from "mobx";
import $api from "../http";

interface IBookingDates{
    start: string;
    end: string;
}

class BookingStore{
    constructor() {
        makeAutoObservable(this)
    }

    bookedDates: IBookingDates[] = [];
    calendarLoading = false;

    async fetchBookingDates(adId: string){
        try{
            this.calendarLoading = true;
            const response = await $api.get(`/calendar/${adId}`);
            runInAction(() => {
                this.bookedDates = response.data
            })
        }catch(e){
            console.log(e)
        }finally{
            this.calendarLoading = false;
        }
    }

    async reserve(adId: string, start: string, end: string){
        try{
            const response = await $api.post('/calendar/reserve', {
                advertisementId: adId,
                startDate: start,
                endDate: end
            })

            await this.fetchBookingDates(adId);
            return response.data
        }catch(e){
            console.log(e)
        }
    }

}

export default new BookingStore;