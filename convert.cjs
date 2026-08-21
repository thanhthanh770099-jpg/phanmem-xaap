const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile(path.join(__dirname, 'DANH SÁCH BT, TBND 20 ap moi.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'danh-sach-lanh-dao.json'), JSON.stringify(data, null, 2));
console.log('Done!');
