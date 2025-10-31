module.exports = class UserDto {
    email;
    id;
    isActivated;
    firstName;
    lastName;
    avatarUrl;

    constructor(model){
        this.email = model.email;
        this.id = model.id;
        this.isActivated = model.isActivated;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.avatarUrl = model.avatarUrl || null;
    }
}