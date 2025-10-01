const TokenModel = {
    async findOne(query) {
        const fs = require('fs');
        const path = require('path');
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        return db.tokens.find(token => {
            if(query.userId) return token.userId === query.userId;
            if(query.refreshToken) return token.refreshToken === query.refreshToken;
            return false;
        });
    },
    
    async create(tokenData) {
        const fs = require('fs');
        const path = require('path');
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        const token = { ...tokenData };
        db.tokens.push(token);
        fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
        return token;
    },
    
    async deleteOne(query) {
        const fs = require('fs');
        const path = require('path');
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
        db.tokens = db.tokens.filter(token => token.refreshToken !== query.refreshToken);
        fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
        return { deletedCount: 1 };
    }
};

module.exports = TokenModel;