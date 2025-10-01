const fs = require('fs');
const path = require('path');

const UserModel = {
    async findOne(query) {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        return db.users.find(user => {
            if(query.email){
                return user.email === query.email;
            }
            if(query.activationLink){
                return user.activationLink === query.activationLink;
            }
            return false;
        });
    },
    
    async create(userData) {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        const user = { id: Date.now().toString(), ...userData };
        db.users.push(user);
        fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
        return user;
    },
    
    async findByIdAndUpdate(id, update) {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        const userIndex = db.users.findIndex(user => user.id === id);
        if(userIndex !== -1) {
            db.users[userIndex] = { ...db.users[userIndex], ...update };
            fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
            return db.users[userIndex];
        }
        return null;
    },

    async findById(id) {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        const user = db.users.find(user => user.id === id);
        return user;
    }
};

module.exports = UserModel;