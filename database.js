const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database at:', dbPath);
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
            if (err) console.error("❌ Error creating users table:", err);
            else {
                console.log("✅ Users table ready");
                createDefaultAdmin();
            }
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
            responsibilities TEXT
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
            tags TEXT,
            image_url TEXT,
            technologies TEXT,
            features TEXT
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
    const password = 'password123';
    const saltRounds = 10;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('❌ Error checking for admin user:', err.message);
            return;
        }

        if (!row) {
            console.log('🔧 Creating default admin user...');
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error('❌ Error hashing password:', err.message);
                    return;
                }
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (err) => {
                    if (err) {
                        console.error("❌ Error creating default admin:", err.message);
                    } else {
                        console.log("✅ Default admin created successfully (username: admin, password: password123)");
                        console.log("⚠️  IMPORTANT: Change the default password after first login!");
                    }
                });
            });
        } else {
            console.log("✅ Admin user already exists");
        }
    });
}

// Ensure database is initialized on startup (important for Render's ephemeral filesystem)
function ensureDatabaseReady() {
    console.log('🔍 Checking database status...');

    // Double-check admin user exists after tables are created
    setTimeout(() => {
        db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row) => {
            if (err) {
                console.error('❌ Error checking admin count:', err.message);
                return;
            }
            if (!row || row.count === 0) {
                console.log('⚠️  Admin user not found, recreating...');
                createDefaultAdmin();
            } else {
                console.log('✅ Database fully initialized and ready');
            }
        });
    }, 2000);
}

// Call database ready check
ensureDatabaseReady();

module.exports = db;
