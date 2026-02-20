// scripts/convertWahapedia.js
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// ตั้งค่า Path ของไฟล์
const CSV_DIR = path.join(__dirname, '../data'); // โฟลเดอร์ที่คุณเก็บ CSV
const JSON_DIR = path.join(__dirname, '../app/data/wahapedia'); // โฟลเดอร์ปลายทางที่จะเก็บ JSON

// สร้างโฟลเดอร์ปลายทางถ้ายังไม่มี
if (!fs.existsSync(JSON_DIR)) {
    fs.mkdirSync(JSON_DIR, { recursive: true });
}

// เช็คว่ามีโฟลเดอร์ CSV อยู่จริงไหม
if (!fs.existsSync(CSV_DIR)) {
    console.error(`❌ Directory not found: ${CSV_DIR}`);
    process.exit(1);
}

console.log('🚀 Starting CSV to JSON conversion...\n');

// ✅ อ่านไฟล์ทั้งหมดในโฟลเดอร์ CSV_DIR
const allFiles = fs.readdirSync(CSV_DIR);

// ✅ กรองเอาเฉพาะไฟล์นามสกุล .csv
const csvFiles = allFiles.filter(file => file.toLowerCase().endsWith('.csv'));

if (csvFiles.length === 0) {
    console.log(`⚠️ No CSV files found in ${CSV_DIR}`);
} else {
    // ✅ วนลูปแปลงไฟล์ CSV ทุกไฟล์ที่เจอ
    csvFiles.forEach(file => {
        const csvFilePath = path.join(CSV_DIR, file);
        const jsonFileName = file.replace(/\.csv$/i, '.json');
        const jsonFilePath = path.join(JSON_DIR, jsonFileName);

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
            },
            error: function(error) {
                console.error(`❌ Error parsing ${file}:`, error);
            }
        });
    });
}

console.log('\n🎉 Conversion process finished!');