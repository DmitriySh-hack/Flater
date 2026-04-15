module.exports = class EmployeeDTO{
    id;
    nickname;
    name;
    position;


    constructor(model){
        this.id = model.id;
        this.name = model.name;
        this.nickname = model.nickname;
        this.position = model.position;
    }
}