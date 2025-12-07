// Load environment variables
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/index');

const app = express();
// Trust proxy (required for Cloudflare/Render to pass correct IP/Protocol)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://balajib3006.vercel.app';

// List the known allowed origins here, plus any others you need
const whitelist = [
    'http://localhost:3000',
    'https://balajib3006.vercel.app',
    FRONTEND_URL,
    // add variants if needed:
    // 'https://www.profile-warm.onrender.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Log the incoming origin for debugging (will appear in Render logs)
        console.log('CORS check - Origin:', origin);

        // allow requests with no origin (curl, server-to-server)
        if (!origin) return callback(null, true);

        // Exact match against whitelist
        if (whitelist.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Not allowed
        const err = new Error('Not allowed by CORS');
        err.status = 403;
        return callback(err);
    },
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'] // optional
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_change_this_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production', // true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Request Logging Middleware


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', indexRoutes);

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// 404 Handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

// Start Server (only in local development, not on Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log('========================================');
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`✅ Environment: ${NODE_ENV}`);
        console.log(`✅ CORS Origins: ${process.env.ALLOWED_ORIGINS || 'Development mode (all origins)'}`);
        console.log('========================================');
    });
}

// Global Error Handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📛 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

// Export the app for Vercel serverless functions
module.exports = app;
