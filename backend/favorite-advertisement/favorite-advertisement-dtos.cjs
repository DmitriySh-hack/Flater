module.exports = class FavoriteAdvertisementDTO{
    id;
    advertisementId;
    userId;
    createdAt;

    constructor(model){
        this.id = model.id;
        this.advertisementId = model.advertisementId;
        this.userId = model.userId;
        this.createdAt = model.create_at;
    }
}