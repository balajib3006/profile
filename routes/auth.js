const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');

// Admin Login Page (Redirect to static file)
router.get('/login', (req, res) => {
    console.log('GET /auth/login hit');
    if (req.session.userId) {
        return res.redirect('/admin/dashboard.html');
    }
    res.redirect('/admin/login.html');
});

// Handle Login
router.post('/login', (req, res) => {
    console.log('POST /auth/login hit');
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (isValid) {
            req.session.userId = user.id;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Check Auth Status
router.get('/check', (req, res) => {
    res.json({ authenticated: !!req.session.userId });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

module.exports = router;
