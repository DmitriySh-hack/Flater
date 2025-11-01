require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const router = require('./router/index.cjs')
const errorMiddleware = require('./middleware/error-middleware.cjs');
const { getPool } = require('./db-mssql.cjs');

const PORT = process.env.PORT || 5000

const app = express();
const path = require('path');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

// Раздача статических файлов (аватарок)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', router);
app.use(errorMiddleware);

app.get('/users', (req, res) => {
    return res.json({ ok: true })
})

const start = async () => {
    try{
        await getPool();
        app.listen(PORT, () => console.log(`Server ${PORT} started`))
    }catch (error){
        console.log(error)  
    }
}

start();