require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const indexRoutes = require('./routes/index');

const app = express();

// Trust proxy for proper headers in production
app.set('trust proxy', 1);

// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://balajib3006.vercel.app';
const whitelist = [
    'http://localhost:3000',
    'https://balajib3006.vercel.app',
    FRONTEND_URL,
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('CORS check - Origin:', origin);
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        const err = new Error('Not allowed by CORS');
        err.status = 403;
        return callback(err);
    },
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'b65d1f215317fc7d4de73d863cb6c5bc73c57793e3f0009c71fd166f4b0d1d03',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', indexRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Serve frontend in production (for client-side routing)
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../client/dist');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// 404 Handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

// Export the app for Vercel serverless functions
module.exports = app;