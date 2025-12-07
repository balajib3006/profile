const path = require('path');
const bcrypt = require('bcrypt');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const usePostgres = isProduction || process.env.DATABASE_URL;

let db;

if (usePostgres) {
    // Use PostgreSQL for production (Vercel Postgres or external)
    const { Pool } = require('pg');
    const { sql } = require('@vercel/postgres');

    // Use Vercel Postgres if available, otherwise use regular pg Pool
    if (isVercel && process.env.POSTGRES_URL) {
        console.log('✅ Using Vercel Postgres');
        db = sql;
    } else if (process.env.DATABASE_URL) {
        console.log('✅ Using PostgreSQL with connection pool');
        db = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
                rejectUnauthorized: false
            }
        });
    }

    initPostgresDatabase();
} else {
    // Use SQLite for local development
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'portfolio.db');

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
        } else {
            console.log('✅ Connected to the SQLite database at:', dbPath);
            initSQLiteDatabase();
        }
    });
}

// PostgreSQL Initialization
async function initPostgresDatabase() {
    try {
        // Users Table
        await db.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )`);
        console.log("✅ Users table ready");

        // Personal Details Table
        await db.query(`CREATE TABLE IF NOT EXISTS personal_details (
            id SERIAL PRIMARY KEY,
            name TEXT,
            email TEXT,
            phone TEXT,
            location TEXT,
            bio TEXT,
            work_contact TEXT,
            portfolio_url TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            gitlab_url TEXT,
            orcid_url TEXT,
            google_scholar_url TEXT,
            profile_picture TEXT
        )`);

        // About Table
        await db.query(`CREATE TABLE IF NOT EXISTS about (
            id SERIAL PRIMARY KEY,
            summary TEXT,
            experience_years TEXT,
            projects_completed TEXT,
            companies_count TEXT
        )`);

        // Experience Table
        await db.query(`CREATE TABLE IF NOT EXISTS experience (
            id SERIAL PRIMARY KEY,
            title TEXT,
            company TEXT,
            period TEXT,
            responsibilities TEXT,
            location TEXT
        )`);

        // Skills Table
        await db.query(`CREATE TABLE IF NOT EXISTS skills (
            id SERIAL PRIMARY KEY,
            category TEXT,
            name TEXT,
            level INTEGER
        )`);

        // Projects Table
        await db.query(`CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title TEXT,
            description TEXT,
            tags TEXT,
            image_url TEXT,
            technologies TEXT,
            features TEXT,
            cad_file TEXT
        )`);

        // Messages Table
        await db.query(`CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Certifications Table
        await db.query(`CREATE TABLE IF NOT EXISTS certifications (
            id SERIAL PRIMARY KEY,
            name TEXT,
            issuer TEXT,
            date TEXT,
            link TEXT,
            type TEXT DEFAULT 'Certification',
            embed_code TEXT
        )`);

        // Publications Table
        await db.query(`CREATE TABLE IF NOT EXISTS publications (
            id SERIAL PRIMARY KEY,
            title TEXT,
            publisher TEXT,
            date TEXT,
            link TEXT
        )`);

        // Notification Settings Table
        await db.query(`CREATE TABLE IF NOT EXISTS notification_settings (
            id SERIAL PRIMARY KEY,
            email_notifications INTEGER DEFAULT 0,
            whatsapp_notifications INTEGER DEFAULT 0,
            notification_email TEXT,
            whatsapp_number TEXT
        )`);

        console.log("✅ PostgreSQL tables initialized");

        // Create default admin
        await createDefaultAdminPostgres();
    } catch (err) {
        console.error('❌ Error initializing PostgreSQL:', err);
    }
}

// SQLite Initialization (original function)
function initSQLiteDatabase() {
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
                createDefaultAdminSQLite();
            }
        });

        // Personal Details Table
        db.run(`CREATE TABLE IF NOT EXISTS personal_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            phone TEXT,
            location TEXT,
            bio TEXT,
            work_contact TEXT,
            portfolio_url TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            gitlab_url TEXT,
            orcid_url TEXT,
            google_scholar_url TEXT,
            profile_picture TEXT
        )`);

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
            responsibilities TEXT,
            location TEXT
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
            features TEXT,
            cad_file TEXT
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

        // Certifications Table
        db.run(`CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            issuer TEXT,
            date TEXT,
            link TEXT,
            type TEXT DEFAULT 'Certification',
            embed_code TEXT
        )`);

        // Publications Table
        db.run(`CREATE TABLE IF NOT EXISTS publications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            publisher TEXT,
            date TEXT,
            link TEXT
        )`);

        // Notification Settings Table
        db.run(`CREATE TABLE IF NOT EXISTS notification_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_notifications INTEGER DEFAULT 0,
            whatsapp_notifications INTEGER DEFAULT 0,
            notification_email TEXT,
            whatsapp_number TEXT
        )`);
    });
}

// Create default admin for PostgreSQL
async function createDefaultAdminPostgres() {
    const username = 'admin';
    const password = 'admin123';
    const saltRounds = 10;

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows && result.rows.length === 0) {
            console.log('🔧 Creating default admin user...');
            const hash = await bcrypt.hash(password, saltRounds);
            await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hash]);
            console.log("✅ Default admin created successfully (username: admin, password: admin123)");
            console.log("⚠️  IMPORTANT: Change the default password after first login!");
        } else {
            console.log("✅ Admin user already exists");
        }
    } catch (err) {
        console.error('❌ Error with admin user:', err.message);
    }
}

// Create default admin for SQLite (original function)
function createDefaultAdminSQLite() {
    const username = 'admin';
    const password = 'admin123';
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
                        console.log("✅ Default admin created successfully (username: admin, password: admin123)");
                        console.log("⚠️  IMPORTANT: Change the default password after first login!");
                    }
                });
            });
        } else {
            console.log("✅ Admin user already exists");
        }
    });
}

// Export database connection and metadata
module.exports = db;
module.exports.isPostgres = usePostgres;
module.exports.isVercel = isVercel;
