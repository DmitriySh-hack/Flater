module.exports = class BookingAdvertisementDTO{
    id;
    advertisementId;
    userId;
    createdAt;
    constructor(model){
        this.id = model.id;
        this.advertisementId = model.advertisement_id;
        this.userId = model.user_id;
        this.createdAt = model.create_at;
    }
}