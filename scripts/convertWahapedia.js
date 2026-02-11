// scripts/convertWahapedia.js
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// ตั้งค่า Path ของไฟล์
const CSV_DIR = path.join(__dirname, '../data'); // โฟลเดอร์ที่คุณเก็บ CSV (แก้ให้ตรงกับของคุณ)
const JSON_DIR = path.join(__dirname, '../app/data/wahapedia'); // โฟลเดอร์ปลายทางที่จะเก็บ JSON

// สร้างโฟลเดอร์ปลายทางถ้ายังไม่มี
if (!fs.existsSync(JSON_DIR)) {
    fs.mkdirSync(JSON_DIR, { recursive: true });
}

// รายชื่อไฟล์ที่ต้องการแปลง
const filesToConvert = [
    'Stratagems.csv',
    'Abilities.csv',
    'Detachment_abilities.csv',
    'Datasheets_abilities.csv',
    'Factions.csv'
];

console.log('🚀 Starting CSV to JSON conversion...\n');

filesToConvert.forEach(file => {
    const csvFilePath = path.join(CSV_DIR, file);
    const jsonFileName = file.replace('.csv', '.json');
    const jsonFilePath = path.join(JSON_DIR, jsonFileName);

    if (fs.existsSync(csvFilePath)) {
        const csvData = fs.readFileSync(csvFilePath, 'utf8');

        // แปลง CSV เป็น JSON (Wahapedia ใช้ | เป็นตัวคั่น)
        Papa.parse(csvData, {
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function (results) {
                // ลบข้อมูลที่ว่างเปล่า (บางทีมีคอลัมน์ขยะติดมา)
                const cleanedData = results.data.map(row => {
                    const newRow = {};
                    for (const key in row) {
                        if (key && key.trim() !== '') {
                            newRow[key.trim()] = row[key];
                        }
                    }
                    return newRow;
                });

                // บันทึกไฟล์ JSON
                fs.writeFileSync(jsonFilePath, JSON.stringify(cleanedData, null, 2));
                console.log(`✅ Converted: ${file} -> ${jsonFileName} (${cleanedData.length} records)`);
            }
        });
    } else {
        console.log(`❌ File not found: ${csvFilePath}`);
    }
});

console.log('\n🎉 Conversion process finished!');