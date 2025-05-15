const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
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
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Initialize express app
const app = express();

// Apply Helmet middleware with relaxed settings for Vercel deployment
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());

// CORS configuration
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
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.post('/api/articles', authenticate, async (req, res) => {
  try {
    // Check if user has permission (admin or editor)
    if (!['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, summary, article_text, date, image, category, featured } = req.body;
    const article = await articleService.createArticle(title, summary, article_text, date, image, category, featured);
    res.status(201).json(article);
  } catch (error) {
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

app.get('/api/articles/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const articles = await articleService.getArticlesByCategory(category, limit);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/featured', async (req, res) => {
  try {
    console.log('Received request for featured articles');
    const limit = parseInt(req.query.limit) || 3;
    const articles = await articleService.getFeaturedArticles(limit);
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

app.get('/api/articles/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const article = await articleService.getArticleById(articleId);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
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