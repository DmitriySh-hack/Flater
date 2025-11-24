module.exports = class Advertisment {
    id;
    title;
    price;
    city;
    street;
    countOfRooms;
    images;
    userID;

    constructor(model){
        this.id = model.id;
        this.title = model.title;
        this.price = model.price;
        this.city = model.city;
        this.street = model.street;
        this.countOfRooms = model.countOfRooms;
        this.images = model.images;
        this.userID = model.userID;
    }
}
