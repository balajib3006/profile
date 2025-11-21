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
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

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

// Start Server
app.listen(PORT, () => {
    console.log('========================================');
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Environment: ${NODE_ENV}`);
    console.log(`✅ CORS Origins: ${process.env.ALLOWED_ORIGINS || 'Development mode (all origins)'}`);
    console.log('========================================');
});

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

