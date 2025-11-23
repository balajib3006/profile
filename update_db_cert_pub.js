const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Certifications Table
    db.run(`CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        issuer TEXT,
        date TEXT,
        link TEXT
    )`, (err) => {
        if (err) console.error("Error creating certifications table:", err);
        else console.log("Certifications table created successfully");
    });

    // Publications Table
    db.run(`CREATE TABLE IF NOT EXISTS publications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        publisher TEXT,
        date TEXT,
        link TEXT
    )`, (err) => {
        if (err) console.error("Error creating publications table:", err);
        else console.log("Publications table created successfully");
    });
});

db.close();
