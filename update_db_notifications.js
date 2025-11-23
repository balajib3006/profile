const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Notification Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email_notifications INTEGER DEFAULT 0,
        whatsapp_notifications INTEGER DEFAULT 0,
        notification_email TEXT,
        whatsapp_number TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating notification_settings table:", err);
        } else {
            console.log("Notification settings table created successfully");

            // Insert default settings
            db.run(`INSERT INTO notification_settings (email_notifications, whatsapp_notifications) 
                    SELECT 0, 0 
                    WHERE NOT EXISTS (SELECT 1 FROM notification_settings LIMIT 1)`, (err) => {
                if (err) console.error("Error inserting default settings:", err);
                else console.log("Default notification settings initialized");

                db.close();
            });
        }
    });
});
