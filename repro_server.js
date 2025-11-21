const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = 3001; // Different port

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Session Setup
app.use(session({
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Logging
app.use((req, res, next) => {
    console.log(`[TEST] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', indexRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Test Server running on http://localhost:${PORT}`);
});
