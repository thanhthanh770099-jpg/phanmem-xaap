const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'danh-sach-lanh-dao.json'), 'utf-8'));
const cleanData = [];

// Data starts from index 4 to 23
for (let i = 4; i < 24; i++) {
    const row = data[i];
    cleanData.push({
        id: row[0],
        ap: row[1],
        truongBan: row[2],
        sdtTruongBan: row[3],
        biThu: row[4],
        sdtBiThu: row[5]
    });
}

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'lanh-dao.json'), JSON.stringify(cleanData, null, 2));
console.log('Cleaned!');
