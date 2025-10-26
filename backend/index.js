const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const articleService = require('./articleService');
const healthService = require('./healthService');

// Load environment variables
dotenv.config();

// JWT Secret - Store this in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'development-jwt-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret';

if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || !REFRESH_TOKEN_SECRET)) {
  console.error('Warning: JWT_SECRET and/or REFRESH_TOKEN_SECRET not set in production environment');
}

const JWT_EXPIRES_IN = '1h';
const ACCESS_TOKEN_EXPIRES_IN = '30d'; // Changed from '1h' to 30 days
const REFRESH_TOKEN_EXPIRES_IN = '90d'; // Changed from '7d' to 90 days

// Initialize express app
const app = express();

// Apply Helmet middleware with relaxed settings for Vercel deployment
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());

// CORS configuration
const allowedOrigins =  '*'; // Allow all origins for now
/*
const allowedOrigins = [
  'https://politicalgossips.vercel.app',
  'https://politicalgossips.com',
  'https://www.politicalgossips.com',
  'https://politicalgossips-frontend-three.vercel.app',
  'https://politicalgossips.com',
  'www.politicalgossips.com',
  'politicalgossips.com',
  'politicalgossips-frontend-lim4hpu1x-vardh1n.vercel.app',
  'https://politicalgossips-frontend-lim4hpu1x-vardh1n.vercel.app',
];
*/
// API access middleware
const apiAccessMiddleware = (req, res, next) => {
  const isAPIRequest = req.path.startsWith('/api/');
  const isBrowserRequest = req.headers['sec-fetch-mode'] === 'navigate';
  
  // If it's an API request and it's a direct browser navigation
  if (isAPIRequest && isBrowserRequest) {
    return res.status(403).json({
      error: 'Direct browser access to API endpoints is not allowed',
      message: 'Please access the API through the frontend application'
    });
  }
  
  next();
};

// Apply API access middleware before CORS
app.use(apiAccessMiddleware);

app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin} - Sec-Fetch-Mode: ${req.headers['sec-fetch-mode']}`);
  next();
});

// Connect to MongoDB - use a connection function instead
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    cachedDb = client;
    console.log('Successfully connected to MongoDB Cloud Cluster');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
}

// Call this before your routes
connectToDatabase().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1); // Exit if we can't connect to the database
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'editor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  refreshToken: {
    type: String
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    // In production, you might want to restrict registration or require admin privileges
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      password,
      role: role || 'editor'
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    
    // Store refresh token in database for this user
    user.refreshToken = refreshToken;
    await user.save();
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add refresh token endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user with this refresh token
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// API Routes
app.post('/api/articles', authenticate, upload.single('image'), async (req, res) => {
  try {
    // Check if user has permission (admin or editor)
    if (!['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Access form fields from req.body and file from req.file
    const { title, summary, article_text, date, category, featured } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Convert featured from string to boolean if it comes as string
    const isFeatured = featured === 'true' || featured === true;
    
    const article = await articleService.createArticle(
      title, 
      summary, 
      article_text, 
      date, 
      req.file, // Pass the entire file object
      category, 
      isFeatured
    );
    
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/latest', async (req, res) => {
  try {
    console.log('Received request for latest articles');
    const limit = parseInt(req.query.limit) || 10;
    const articles = await articleService.getLatestArticles(limit);
    console.log(`Sending ${articles.length} latest articles`);
    res.json(articles);
  } catch (error) {
    console.error('Error in /api/articles/latest:', error);
    res.status(500).json({ 
      error: 'Failed to fetch latest articles',
      details: error.message 
    });
  }
});

// Update the category endpoint to be case-insensitive
app.get('/api/articles/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Make the category search case-insensitive
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    
    console.log(`Fetching articles for category: ${normalizedCategory} (original: ${category})`);
    
    const articles = await articleService.getArticlesByCategory(normalizedCategory, limit);
    
    console.log(`Found ${articles.length} articles for category: ${normalizedCategory}`);
    
    res.json(articles);
  } catch (error) {
    console.error(`Error fetching articles for category ${category}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/featured', async (req, res) => {
  try {
    console.log('Received request for featured articles');
    const limit = parseInt(req.query.limit) || 3;
    const articles = await articleService.getFeaturedArticles(limit);
    
    // Debug image info
    articles.forEach(article => {
      console.log(`Article ${article.articleId} - Has image: ${!!article.image}, Image content type: ${article.image?.contentType}`);
    });
    
    console.log(`Sending ${articles.length} featured articles`);
    res.json(articles);
  } catch (error) {
    console.error('Error in /api/articles/featured:', error);
    res.status(500).json({ 
      error: 'Failed to fetch featured articles',
      details: error.message 
    });
  }
});

// Get article by ID - simplified to work with just ID parameter
app.get('/api/articles/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    // Validate article ID
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    console.log(`Fetching article with ID: ${articleId}`);
    const article = await articleService.getArticleById(articleId);
    
    if (!article) {
      console.log(`Article not found: ${articleId}`);
      return res.status(404).json({ error: 'Article not found' });
    }
    
    console.log(`Successfully retrieved article: ${articleId} - ${article.title}`);
    res.json(article);
  } catch (error) {
    console.error(`Error fetching article ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Alternative image endpoint for backwards compatibility
app.get('/api/articles/:id/image', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    const article = await articleService.getArticleById(articleId);
    
    if (!article || !article.image || !article.image.data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Set proper headers for cross-origin image sharing
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', article.image.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    res.send(article.image.data);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Primary image endpoint - works with just article ID
app.get('/image/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const parsedId = parseInt(articleId);
    
    if (isNaN(parsedId)) {
      console.log('Invalid article ID format');
      return res.status(400).send('Invalid article ID');
    }
    
    console.log(`Serving image for article ID: ${parsedId}`);
    const article = await articleService.getArticleById(parsedId);
    
    if (!article || !article.image || !article.image.data) {
      console.log(`Image not found for article: ${parsedId}`);
      return res.status(404).send('Image not found');
    }
    
    // Convert Buffer to actual image data if needed
    let imageData = article.image.data;
    if (imageData.buffer) {
      imageData = Buffer.from(imageData.buffer);
    } else if (!(imageData instanceof Buffer)) {
      imageData = Buffer.from(imageData);
    }
    
    // Determine content type
    const contentType = article.image.contentType || 'image/jpeg';
    
    console.log(`Image details - Type: ${contentType}, Size: ${imageData.length} bytes`);
    
    // Set proper headers for social media crawlers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': imageData.length,
      'Content-Disposition': 'inline', // CRITICAL: Display inline, not as download
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes'
    });
    
    console.log(`Successfully serving image for article: ${parsedId}`);
    res.end(imageData);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Error retrieving image');
  }
});

// Add OPTIONS handler for CORS preflight
app.options('/image/:articleId', (req, res) => {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Max-Age': '86400'
  });
  res.end();
});

// Support HEAD requests for WhatsApp crawler
app.head('/image/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const parsedId = parseInt(articleId);
    
    if (isNaN(parsedId)) {
      return res.status(400).end();
    }
    
    const article = await articleService.getArticleById(parsedId);
    
    if (!article || !article.image || !article.image.data) {
      return res.status(404).end();
    }
    
    let imageData = article.image.data;
    if (imageData.buffer) {
      imageData = Buffer.from(imageData.buffer);
    } else if (!(imageData instanceof Buffer)) {
      imageData = Buffer.from(imageData);
    }
    
    const contentType = article.image.contentType || 'image/jpeg';
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': imageData.length,
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.end();
  } catch (error) {
    console.error('Error in HEAD request:', error);
    res.status(500).end();
  }
});

// Root route for basic checks
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Political Gossips API is running'
  });
});

// Root route for basic checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Political Gossips API is running'
  });
});

// Health check routes using the health service
app.get('/api/health', healthService.healthCheckHandler);
app.get('/health', healthService.healthCheckHandler);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path
  });
};

// Add error handler at the end
app.use(errorHandler);

// Set up server to listen on port if running directly (not in serverless)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for serverless use
module.exports = app;

// Update article endpoint
app.put('/api/articles/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    // Check if user has admin permission for updates
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for updating articles' });
    }
    
    const articleId = parseInt(req.params.id);
    
    // Validate article ID
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    const { title, summary, article_text, date, category, featured } = req.body;
    
    // Check if article exists
    const existingArticle = await articleService.getArticleById(articleId);
    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Convert featured from string to boolean if it comes as string
    const isFeatured = featured === 'true' || featured === true || featured === 'on';
    
    console.log(`Updating article ${articleId}: ${title}`);
    
    // Update the article
    const updatedArticle = await articleService.updateArticle(
      articleId,
      title,
      summary,
      article_text,
      date,
      req.file, // This will be null if no new image is uploaded
      category,
      isFeatured
    );
    
    console.log(`Successfully updated article ${articleId}`);
    res.json({
      message: 'Article updated successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete article endpoint
app.delete('/api/articles/:id', authenticate, async (req, res) => {
  try {
    // Check if user has admin permission for deletion
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for deleting articles' });
    }
    
    const articleId = parseInt(req.params.id);
    
    // Validate article ID
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    // Check if article exists
    const existingArticle = await articleService.getArticleById(articleId);
    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    console.log(`Deleting article ${articleId}: ${existingArticle.title}`);
    
    // Delete the article
    await articleService.deleteArticle(articleId);
    
    console.log(`Successfully deleted article ${articleId}`);
    
    res.json({
      message: 'Article deleted successfully',
      articleId: articleId
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: error.message });
  }
});

// Contact form schema
const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous'
  },
  email: {
    type: String,
    default: 'No contact provided'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);

// Rate limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 submissions per 15 minutes per IP
  message: {
    error: 'Too many contact form submissions. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Contact form endpoint - just store in database
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Get client IP and User Agent for security logging
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Create and save submission
    const submission = new ContactSubmission({
      name: name?.trim() || 'Anonymous',
      email: email?.trim() || 'No contact provided',
      message: message.trim(),
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    await submission.save();

    console.log(`Contact form submission saved: ${submission._id} from ${submission.name}`);

    res.status(200).json({
      success: true,
      message: 'Your message has been received securely. We will review it and respond if necessary.',
      submissionId: submission._id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    res.status(500).json({
      error: 'Failed to process your submission. Please try again later.'
    });
  }
});

// Admin endpoint to view contact submissions
app.get('/api/admin/contact-submissions', authenticate, async (req, res) => {
  try {
    // Check if user has admin permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await ContactSubmission.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await ContactSubmission.countDocuments();

    res.json({
      submissions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ error: error.message });
  }
});