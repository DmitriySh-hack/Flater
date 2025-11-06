const sql = require('mssql/msnodesqlv8');

//конфинг данных о БД
const config = {
    server: 'DESKTOP-B510029\\SQLEXPRESS',
    database: 'flater_db',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

//Соединение с базой данных
function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => pool)
            .catch(err => {
                poolPromise = undefined;
                throw err;
            });
    }
    return poolPromise;
}

//Функция выполнения SQL запроса
async function query(text, inputs = []) {
    const pool = await getPool();
    const request = pool.request();
    for (const { name, type, value } of inputs) {
        if (type) {
            request.input(name, type, value);
        } else {
            request.input(name, value);
        }
    }
    return request.query(text);
}

module.exports = {
    sql,
    getPool,
    query
};


