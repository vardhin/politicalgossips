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
    data: Buffer,
    contentType: String,
    filename: String
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
      image: {
        data: image.buffer,
        contentType: image.mimetype,
        filename: image.originalname
      },
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

// Update an existing article
const updateArticle = async (articleId, title, summary, article_text, date, image, category, featured = false) => {
  try {
    console.log(`Updating article ${articleId} with data:`, { title, summary, category, featured });
    
    // Find the existing article
    const existingArticle = await Article.findOne({ articleId });
    if (!existingArticle) {
      throw new Error('Article not found');
    }
    
    // Prepare update data
    const updateData = {
      title: title || existingArticle.title,
      summary: summary || existingArticle.summary,
      article_text: article_text || existingArticle.article_text,
      category: category || existingArticle.category,
      featured: featured !== undefined ? featured : existingArticle.featured
    };
    
    // Handle date update
    if (date) {
      updateData.date = new Date(date);
    }
    
    // Handle image update (only if new image is provided)
    if (image && image.buffer) {
      updateData.image = {
        data: image.buffer,
        contentType: image.mimetype,
        filename: image.originalname || `article_${articleId}_${Date.now()}`
      };
      console.log('Updating image for article:', articleId);
    }
    
    // Generate new hash if title or date changed
    if (title || date) {
      const hashDate = updateData.date || existingArticle.date;
      updateData.hash = generateHash(updateData.title, hashDate);
    }
    
    // Update the article
    const updatedArticle = await Article.findOneAndUpdate(
      { articleId },
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );
    
    if (!updatedArticle) {
      throw new Error('Failed to update article');
    }
    
    console.log(`Successfully updated article ${articleId}`);
    return updatedArticle;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

// Delete an article
const deleteArticle = async (articleId) => {
  try {
    console.log(`Deleting article ${articleId}`);
    
    const deletedArticle = await Article.findOneAndDelete({ articleId });
    
    if (!deletedArticle) {
      throw new Error('Article not found');
    }
    
    console.log(`Successfully deleted article ${articleId}`);
    return deletedArticle;
  } catch (error) {
    console.error('Error deleting article:', error);
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
  updateArticle,
  deleteArticle,
  getLatestArticles,
  getArticlesByCategory,
  getFeaturedArticles,
  getArticleById
};