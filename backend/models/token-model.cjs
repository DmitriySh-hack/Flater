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
    
    async updateOne(query, update){
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, '../db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        let updated = null;
        db.tokens = db.tokens.map(token => {
            const isMatch = (query.userId && token.userId === query.userId) || (query.refreshToken && token.refreshToken === query.refreshToken);
            if(isMatch){
                updated = { ...token, ...update };
                return updated;
            }
            return token;
        });
        if(updated){
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        }
        return updated;
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