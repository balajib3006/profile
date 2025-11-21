const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.use(requireLogin);

// --- About Section ---
router.get('/about', (req, res) => {
    db.get("SELECT * FROM about ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

router.post('/about', (req, res) => {
    const { summary, experience_years, projects_completed, companies_count } = req.body;
    db.run(`INSERT INTO about (summary, experience_years, projects_completed, companies_count) VALUES (?, ?, ?, ?)`,
        [summary, experience_years, projects_completed, companies_count],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

// --- Experience Section ---
router.get('/experience', (req, res) => {
    db.all("SELECT * FROM experience ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const experience = rows.map(row => ({
            ...row,
            responsibilities: JSON.parse(row.responsibilities || '[]')
        }));
        res.json(experience);
    });
});

router.post('/experience/add', (req, res) => {
    const { title, company, period, responsibilities } = req.body;
    const respArray = responsibilities.split('\n').filter(line => line.trim() !== '');

    db.run(`INSERT INTO experience (title, company, period, responsibilities) VALUES (?, ?, ?, ?)`,
        [title, company, period, JSON.stringify(respArray)],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.post('/experience/delete/:id', (req, res) => {
    db.run("DELETE FROM experience WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// --- Skills Section ---
router.get('/skills', (req, res) => {
    db.all("SELECT * FROM skills ORDER BY category, level DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/skills/add', (req, res) => {
    const { category, name, level } = req.body;
    db.run(`INSERT INTO skills (category, name, level) VALUES (?, ?, ?)`,
        [category, name, level],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.post('/skills/delete/:id', (req, res) => {
    db.run("DELETE FROM skills WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// --- Projects Section ---
router.get('/projects', (req, res) => {
    db.all("SELECT * FROM projects ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const projects = rows.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || '[]')
        }));
        res.json(projects);
    });
});

router.post('/projects/add', (req, res) => {
    const { title, description, image_url, tags } = req.body;
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    db.run(`INSERT INTO projects (title, description, image_url, tags) VALUES (?, ?, ?, ?)`,
        [title, description, image_url, JSON.stringify(tagsArray)],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.post('/projects/delete/:id', (req, res) => {
    db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// --- Messages ---
router.get('/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
