const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add 'type' column
    db.run("ALTER TABLE certifications ADD COLUMN type TEXT DEFAULT 'Certification'", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding type column:", err.message);
        } else {
            console.log("Added 'type' column to certifications table");
        }
    });

    // Add 'embed_code' column
    db.run("ALTER TABLE certifications ADD COLUMN embed_code TEXT", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding embed_code column:", err.message);
        } else {
            console.log("Added 'embed_code' column to certifications table");
        }
    });
});

db.close();
