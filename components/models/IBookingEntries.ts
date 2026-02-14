import type { IADVERTISMENT } from './IAdventisment';

export interface IBookingEntries{
    id: number,
    advertisementId: string,
    startDate: string,
    endDate:string,
    advertisement: IADVERTISMENT,
}