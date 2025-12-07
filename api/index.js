// Vercel Serverless Function Handler
// This file wraps the Express app to work with Vercel's serverless architecture

const app = require('../server');

// Export the Express app as a Vercel serverless function
module.exports = app;
