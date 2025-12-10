module.exports = class AdvertismentWithUserDTO {
    id;
    title;
    price;
    city;
    street;
    countOfRooms;
    images;
    user_id;
    created_at;
    user; // Добавляем поле с информацией о пользователе
    
    constructor(model) {
        this.id = model.id;
        this.title = model.title;
        this.price = model.price;
        this.city = model.city;
        this.street = model.street;
        this.countOfRooms = model.countOfRooms;
        this.images = model.images || [];
        this.user_id = model.user_id;
        this.created_at = model.created_at;
        
        // Если в модели уже есть user (из сервиса), используем его
        if (model.user) {
            this.user = {
                id: model.user.id,
                email: model.user.email,
                firstName: model.user.firstName,
                lastName: model.user.lastName,
                avatar: model.user.avatar || model.user.avatarUrl // Поддержка обоих вариантов
            };
        } else {
            this.user = null;
        }
    }
}