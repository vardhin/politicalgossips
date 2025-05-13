// This file is needed for Vercel serverless functions

// Re-export your Express app
const app = require('../backend/index.js');
module.exports = app;