const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) console.error("Error creating users table:", err);
            else createDefaultAdmin();
        });

        // About Table
        db.run(`CREATE TABLE IF NOT EXISTS about (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            summary TEXT,
            experience_years TEXT,
            projects_completed TEXT,
            companies_count TEXT
        )`);

        // Experience Table
        db.run(`CREATE TABLE IF NOT EXISTS experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            company TEXT,
            period TEXT,
            responsibilities TEXT -- JSON string or newline separated
        )`);

        // Skills Table
        db.run(`CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            name TEXT,
            level INTEGER
        )`);

        // Projects Table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            tags TEXT, -- JSON string
            image_url TEXT,
            technologies TEXT, -- JSON string
            features TEXT -- JSON string
        )`);

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

function createDefaultAdmin() {
    const username = 'admin';
    const password = 'password123'; // Default password, should be changed
    const saltRounds = 10;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) return console.error(err);
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (err) => {
                    if (err) console.error("Error creating default admin:", err);
                    else console.log("Default admin created (admin/password123)");
                });
            });
        }
    });
}

module.exports = db;
