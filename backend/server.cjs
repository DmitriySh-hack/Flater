require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const router = require('./router/index.cjs')
const errorMiddleware = require('./middleware/error-middleware.cjs');

const PORT = process.env.PORT || 5000
DB_URL = path.join(__dirname, 'db.json');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware);

const readDB = async () => {
    try{
        const data = await fs.readFileSync(DB_URL, 'utf-8');
        return JSON.parse(data)
    }catch(e){
        return {
            users: []
        }
    }
}

const writeDB = async (data) => {
    try{
        await fs.writeFileSync(DB_URL, JSON.stringify(data, null, 2))
    }catch(error){
        console.error('Ошибка записи в БД:', error);
    }
}

const start = async () => {
    try{
        const db = await readDB();
        if(!db.users){
            await writeDB({ users: [], tokens: [] })
        }

        app.listen(PORT, () => console.log(`Server ${PORT} started`))
    }catch (error){
        console.log(error)  
    }
}

start();