const express = require('express');
const router = express.Router();
const db = require('../database');
const path = require('path');

// Serve static index.html for the root route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Endpoint to get personal details
router.get('/api/public/personal-details', (req, res) => {
    db.get("SELECT * FROM personal_details ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// API Endpoint to get all portfolio data
router.get('/api/data', (req, res) => {
    const data = {};

    // Fetch About
    db.get("SELECT * FROM about LIMIT 1", (err, about) => {
        if (err) return res.status(500).json({ error: err.message });
        data.about = about || {};

        // Fetch Experience
        db.all("SELECT * FROM experience ORDER BY id DESC", (err, experience) => {
            if (err) return res.status(500).json({ error: err.message });
            data.experience = experience.map(exp => ({
                ...exp,
                responsibilities: JSON.parse(exp.responsibilities || '[]')
            }));

            // Fetch Skills
            db.all("SELECT * FROM skills ORDER BY category, level DESC", (err, skills) => {
                if (err) return res.status(500).json({ error: err.message });
                data.skills = skills;

                // Fetch Projects
                db.all("SELECT * FROM projects ORDER BY id DESC", (err, projects) => {
                    if (err) return res.status(500).json({ error: err.message });
                    data.projects = projects.map(proj => ({
                        ...proj,
                        tags: JSON.parse(proj.tags || '[]')
                    }));

                    res.json(data);
                });
            });
        });
    });
});

// Contact Form Submission API
router.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Save message to database
        await new Promise((resolve, reject) => {
            db.run("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
                [name, email, subject, message],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Check notification settings
        db.get("SELECT * FROM notification_settings LIMIT 1", async (err, settings) => {
            if (!err && settings) {
                const notificationService = require('../services/notificationService');
                const messageData = { name, email, subject, message };

                // Send email notification if enabled
                if (settings.email_notifications && settings.notification_email) {
                    const smtpConfig = {
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT),
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    };

                    try {
                        await notificationService.sendEmailNotification(
                            messageData,
                            settings.notification_email,
                            smtpConfig
                        );
                    } catch (error) {
                        console.error('Failed to send email notification:', error);
                    }
                }

                // Send WhatsApp notification if enabled
                if (settings.whatsapp_notifications && settings.whatsapp_number) {
                    try {
                        await notificationService.sendWhatsAppNotification(
                            messageData,
                            settings.whatsapp_number
                        );
                    } catch (error) {
                        console.error('Failed to send WhatsApp notification:', error);
                    }
                }
            }
        });

        res.json({ success: true, message: 'Message sent successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
