const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Adding cad_file column to projects table...');
    db.run("ALTER TABLE projects ADD COLUMN cad_file TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column added successfully.');
        }
    });
});

db.close();
