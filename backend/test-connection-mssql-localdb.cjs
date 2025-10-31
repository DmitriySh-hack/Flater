const sql = require('mssql/msnodesqlv8');

// Using msnodesqlv8 driver for Windows Authentication and LocalDB
const dbConfig = {
    server: '(localdb)\\MSSQLLocalDB',
    database: 'master',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

async function testConnectionMSSQLLocalDB() {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT DB_NAME() AS currentDb, SUSER_SNAME() AS loginName');
        console.log('✅ Подключение к SQL Server LocalDB установлено:', result.recordset);
    } finally {
        try { await sql.close(); } catch (_) {}
    }
}

module.exports = {
    testConnectionMSSQLLocalDB,
    dbConfig
};


