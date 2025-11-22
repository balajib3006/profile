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

// --- File Upload Configuration ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/profile');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// --- Personal Details Section ---
router.get('/personal-details', (req, res) => {
    db.get("SELECT * FROM personal_details ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

router.post('/personal-details', upload.single('profile_picture'), (req, res) => {
    const {
        name, email, phone, location, bio, work_contact,
        portfolio_url, linkedin_url, github_url, gitlab_url, orcid_url, google_scholar_url
    } = req.body;

    // Get existing data to handle profile picture update/retention
    db.get("SELECT * FROM personal_details ORDER BY id DESC LIMIT 1", (err, existingData) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        let profile_picture = existingData ? existingData.profile_picture : null;

        // If new file uploaded, update profile picture
        if (req.file) {
            profile_picture = req.file.filename;

            // Delete old image if it exists
            if (existingData && existingData.profile_picture) {
                const oldPath = path.join(uploadDir, existingData.profile_picture);
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) console.error('Error deleting old profile picture:', err);
                    });
                }
            }
        }

        // Check if we need to insert or update
        if (existingData) {
            const sql = `UPDATE personal_details SET 
                name = ?, email = ?, phone = ?, location = ?, bio = ?, work_contact = ?,
                portfolio_url = ?, linkedin_url = ?, github_url = ?, gitlab_url = ?, 
                orcid_url = ?, google_scholar_url = ?, profile_picture = ?
                WHERE id = ?`;

            db.run(sql, [
                name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url,
                orcid_url, google_scholar_url, profile_picture, existingData.id
            ], function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, profile_picture });
            });
        } else {
            const sql = `INSERT INTO personal_details (
                name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url, 
                orcid_url, google_scholar_url, profile_picture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, [
                name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url,
                orcid_url, google_scholar_url, profile_picture
            ], function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, profile_picture });
            });
        }
    });
});

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
