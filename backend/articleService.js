const mongoose = require('mongoose');
const crypto = require('crypto');

// Article Schema
const articleSchema = new mongoose.Schema({
  articleId: {
    type: Number,
    unique: true
  },
  hash: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  article_text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Political', 'General'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-increment articleId before saving
articleSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const lastArticle = await this.constructor.findOne({}, {}, { sort: { articleId: -1 } });
    this.articleId = lastArticle ? lastArticle.articleId + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

// Create model
const Article = mongoose.model('Article', articleSchema);

// Generate unique hash
const generateHash = (title, date) => {
  const data = title + date.toString();
  return crypto.createHash('md5').update(data).digest('hex');
};

// Create a new article
const createArticle = async (title, summary, article_text, date, image, category, featured = false) => {
  try {
    const articleDate = date ? new Date(date) : new Date();
    const hash = generateHash(title, articleDate);
    
    const article = new Article({
      title,
      summary,
      article_text,
      date: articleDate,
      image,
      category,
      featured,
      hash
    });
    
    await article.save();
    return article;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

// Fetch latest articles
const getLatestArticles = async (limit = 10) => {
  try {
    console.log('Fetching latest articles with limit:', limit);
    const articles = await Article.find()
      .sort({ date: -1 })
      .limit(limit);
    console.log(`Found ${articles.length} latest articles`);
    return articles;
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    throw error;
  }
};

// Fetch articles by category
const getArticlesByCategory = async (category, limit = 10) => {
  try {
    return await Article.find({ category })
      .sort({ date: -1 })
      .limit(limit);
  } catch (error) {
    console.error(`Error fetching ${category} articles:`, error);
    throw error;
  }
};

// Fetch featured articles
const getFeaturedArticles = async (limit = 3) => {
  try {
    console.log('Fetching featured articles with limit:', limit);
    const articles = await Article.find({ featured: true })
      .sort({ date: -1 })
      .limit(limit);
    console.log(`Found ${articles.length} featured articles`);
    return articles;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }
};

// Fetch article by ID
const getArticleById = async (articleId) => {
  try {
    return await Article.findOne({ articleId });
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
};

module.exports = {
  Article,
  createArticle,
  getLatestArticles,
  getArticlesByCategory,
  getFeaturedArticles,
  getArticleById
};