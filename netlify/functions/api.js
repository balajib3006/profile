const { createServer } = require('@vercel/node');
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('../../database');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['https://balajib3006.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup (using memory store for serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Import routes
const authRoutes = require('../../routes/auth');
const adminRoutes = require('../../routes/admin');
const indexRoutes = require('../../routes/index');

// Use routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', indexRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// Export for serverless
module.exports = app;
