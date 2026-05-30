const ExcelJS = require('exceljs');

async function exportOrdersToExcel(rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Заказы');

    sheet.columns = [
        { header: 'ID клиента', key: 'client_id', width: 22 },
        { header: 'ID продавца', key: 'seller_id', width: 22 },
        { header: 'Цена', key: 'price', width: 15 },
        { header: 'Подтверждение заселения', key: 'move_in_confirmed', width: 28 },
    ];

    (rows || []).forEach((row) => {
        sheet.addRow({
            client_id: row.client_id,
            seller_id: row.seller_id,
            price: row.price,
            move_in_confirmed: row.move_in_confirmed ? 'Да' : 'Нет',
        });
    });

    return workbook.xlsx.writeBuffer();
}

module.exports = { exportOrdersToExcel };
