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
const uploadDir = path.join(__dirname, '../uploads/profile');
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
        const filetypes = /jpeg|jpg|png|gif|webp|step|stp|iges/;
        const mimetype = filetypes.test(file.mimetype) || true; // Mime types for CAD files can be tricky, relying on extension mostly
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only image and CAD files (step, stp, iges) are allowed!'));
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
        portfolio_url, linkedin_url, github_url, gitlab_url, orcid_url, google_scholar_url,
        remove_picture // Check for this flag
    } = req.body;

    // Get existing data to handle profile picture update/retention
    db.get("SELECT * FROM personal_details ORDER BY id DESC LIMIT 1", (err, existingData) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        let profile_picture = existingData ? existingData.profile_picture : null;

        // If remove picture flag is set
        if (remove_picture === 'true') {
            profile_picture = null;
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
        // If new file uploaded, update profile picture
        else if (req.file) {
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
    const { title, company, period, responsibilities, location } = req.body;
    const respArray = responsibilities.split('\n').filter(line => line.trim() !== '');

    db.run(`INSERT INTO experience (title, company, period, responsibilities, location) VALUES (?, ?, ?, ?, ?)`,
        [title, company, period, JSON.stringify(respArray), location],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.put('/experience/edit/:id', (req, res) => {
    const { title, company, period, responsibilities, location } = req.body;
    const respArray = responsibilities.split('\n').filter(line => line.trim() !== '');

    db.run(`UPDATE experience SET title = ?, company = ?, period = ?, responsibilities = ?, location = ? WHERE id = ?`,
        [title, company, period, JSON.stringify(respArray), location, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

// Support both DELETE (standard) and POST (legacy/fallback)
const deleteExperienceHandler = (req, res) => {
    db.run("DELETE FROM experience WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
};
router.delete('/experience/delete/:id', deleteExperienceHandler);
router.post('/experience/delete/:id', deleteExperienceHandler);

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

router.put('/skills/edit/:id', (req, res) => {
    const { category, name, level } = req.body;
    db.run(`UPDATE skills SET category = ?, name = ?, level = ? WHERE id = ?`,
        [category, name, level, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

const deleteSkillHandler = (req, res) => {
    db.run("DELETE FROM skills WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
};
router.delete('/skills/delete/:id', deleteSkillHandler);
router.post('/skills/delete/:id', deleteSkillHandler);

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

router.post('/projects/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'cad_file', maxCount: 1 }]), (req, res) => {
    const { title, description, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    const image_url = req.files['image'] ? req.files['image'][0].filename : null;
    const cad_file = req.files['cad_file'] ? req.files['cad_file'][0].filename : null;

    db.run(`INSERT INTO projects (title, description, image_url, tags, cad_file) VALUES (?, ?, ?, ?, ?)`,
        [title, description, image_url, JSON.stringify(tagsArray), cad_file],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

router.put('/projects/edit/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'cad_file', maxCount: 1 }]), (req, res) => {
    const { title, description, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    // First get existing data to handle file persistence
    db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, existingData) => {
        if (err || !existingData) return res.status(500).json({ success: false, message: err ? err.message : 'Project not found' });

        const image_url = req.files['image'] ? req.files['image'][0].filename : existingData.image_url;
        const cad_file = req.files['cad_file'] ? req.files['cad_file'][0].filename : existingData.cad_file;

        db.run(`UPDATE projects SET title = ?, description = ?, image_url = ?, tags = ?, cad_file = ? WHERE id = ?`,
            [title, description, image_url, JSON.stringify(tagsArray), cad_file, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true });
            }
        );
    });
});

const deleteProjectHandler = (req, res) => {
    db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, project) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // Delete associated files
        if (project.image_url) {
            const imagePath = path.join(uploadDir, project.image_url);
            if (fs.existsSync(imagePath)) fs.unlink(imagePath, err => { if (err) console.error(err); });
        }
        if (project.cad_file) {
            const cadPath = path.join(uploadDir, project.cad_file);
            if (fs.existsSync(cadPath)) fs.unlink(cadPath, err => { if (err) console.error(err); });
        }

        db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        });
    });
};
router.delete('/projects/delete/:id', deleteProjectHandler);
router.post('/projects/delete/:id', deleteProjectHandler);

// --- Messages ---
router.get('/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Dashboard Statistics ---
router.get('/dashboard-stats', (req, res) => {
    const stats = {};

    // Get counts for all sections
    db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
        if (!err) stats.projects = row.count;

        db.get("SELECT COUNT(*) as count FROM experience", (err, row) => {
            if (!err) stats.experience = row.count;

            db.get("SELECT COUNT(*) as count FROM skills", (err, row) => {
                if (!err) stats.skills = row.count;

                db.get("SELECT COUNT(*) as count FROM certifications", (err, row) => {
                    if (!err) stats.certifications = row.count;

                    db.get("SELECT COUNT(*) as count FROM publications", (err, row) => {
                        if (!err) stats.publications = row.count;

                        db.get("SELECT COUNT(*) as count FROM messages", (err, row) => {
                            if (!err) stats.messages = row.count;
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

// --- Certifications ---
router.get('/certifications', (req, res) => {
    db.all("SELECT * FROM certifications ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/certifications/add', (req, res) => {
    const { name, issuer, date, link, type, embed_code } = req.body;
    db.run("INSERT INTO certifications (name, issuer, date, link, type, embed_code) VALUES (?, ?, ?, ?, ?, ?)",
        [name, issuer, date, link, type || 'Certification', embed_code],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

router.put('/certifications/edit/:id', (req, res) => {
    const { name, issuer, date, link, type, embed_code } = req.body;
    db.run("UPDATE certifications SET name = ?, issuer = ?, date = ?, link = ?, type = ?, embed_code = ? WHERE id = ?",
        [name, issuer, date, link, type || 'Certification', embed_code, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

const deleteCertificationHandler = (req, res) => {
    db.run("DELETE FROM certifications WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
};
router.delete('/certifications/delete/:id', deleteCertificationHandler);
router.post('/certifications/delete/:id', deleteCertificationHandler);

// --- Publications ---
router.get('/publications', (req, res) => {
    db.all("SELECT * FROM publications ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/publications/add', (req, res) => {
    const { title, publisher, date, link } = req.body;
    db.run("INSERT INTO publications (title, publisher, date, link) VALUES (?, ?, ?, ?)",
        [title, publisher, date, link],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

router.put('/publications/edit/:id', (req, res) => {
    const { title, publisher, date, link } = req.body;
    db.run("UPDATE publications SET title = ?, publisher = ?, date = ?, link = ? WHERE id = ?",
        [title, publisher, date, link, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

const deletePublicationHandler = (req, res) => {
    db.run("DELETE FROM publications WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
};
router.delete('/publications/delete/:id', deletePublicationHandler);
router.post('/publications/delete/:id', deletePublicationHandler);

// --- Notification Settings ---
router.get('/notification-settings', (req, res) => {
    db.get("SELECT * FROM notification_settings ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { email_notifications: 0, whatsapp_notifications: 0 });
    });
});

router.post('/notification-settings', (req, res) => {
    const { email_notifications, whatsapp_notifications, notification_email, whatsapp_number } = req.body;

    // Check if settings exist
    db.get("SELECT * FROM notification_settings LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (row) {
            // Update existing settings
            db.run(`UPDATE notification_settings SET 
                email_notifications = ?, 
                whatsapp_notifications = ?, 
                notification_email = ?, 
                whatsapp_number = ?
                WHERE id = ?`,
                [email_notifications ? 1 : 0, whatsapp_notifications ? 1 : 0, notification_email, whatsapp_number, row.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true });
                }
            );
        } else {
            // Insert new settings
            db.run(`INSERT INTO notification_settings 
                (email_notifications, whatsapp_notifications, notification_email, whatsapp_number) 
                VALUES (?, ?, ?, ?)`,
                [email_notifications ? 1 : 0, whatsapp_notifications ? 1 : 0, notification_email, whatsapp_number],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true });
                }
            );
        }
    });
});

module.exports = router;
