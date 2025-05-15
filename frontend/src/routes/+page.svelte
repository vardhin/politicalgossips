<script>
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { theme } from './../lib/stores/theme';
  import './../lib/styles/theme.css';
  import NavBar from './../lib/components/NavBar.svelte';
  //hijijijijij
  // Simplified categories
  const categories = ["General", "Political"];
  
  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "Home", active: true },
    { href: "/category/general", label: "General", active: false },
    { href: "/category/political", label: "Political", active: false },
    { href: "/contact", label: "Contact", active: false },
  ];
  
  // Data states
  let featuredArticles = [];
  let latestNews = [];
  let loading = true;
  let error = null;
  
  // Contact form
  let contactName = '';
  let contactEmail = '';
  let contactMessage = '';
  let contactSubmitting = false;
  let contactResult = null;

  // Using environment variable for API URL
  const API_URL = PUBLIC_API_URL;

  // Function to slugify titles for URLs (handles international characters)
  function slugify(text) {
    if (!text) return '';
    
    return text
      .normalize('NFD')
      // Replace non-alphanumeric characters (except dashes) with dashes
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      // Remove consecutive dashes
      .replace(/-+/g, '-')
      // Remove dashes from start and end
      .replace(/^-+|-+$/g, '')
      // Convert to lowercase
      .toLowerCase();
  }

  // Add this near the top of your script section for debugging
  function debugArticleData(article) {
    console.log("Article ID:", article.articleId);
    console.log("Has image property:", !!article.image);
    console.log("Image property:", article.image);
    return article;
  }

  // Function to fetch featured articles
  async function fetchFeaturedArticles() {
    try {
      const response = await fetch(`${API_URL}/articles/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured articles');
      return await response.json();
    } catch (err) {
      console.error('Error fetching featured articles:', err);
      error = err.message;
      return [];
    }
  }

  // Function to fetch latest articles
  async function fetchLatestArticles() {
    try {
      const response = await fetch(`${API_URL}/articles/latest?limit=4`);
      if (!response.ok) throw new Error('Failed to fetch latest articles');
      return await response.json();
    } catch (err) {
      console.error('Error fetching latest articles:', err);
      error = err.message;
      return [];
    }
  }

  // Update the getImageUrl function to consistently use the API_URL
  function getImageUrl(article) {
    if (!article) return "https://placehold.co/600x400/eee/aaa?text=News";
    
    // Ensure articleId exists and is valid
    if (article.articleId || article.id) {
      const id = article.articleId || article.id;
      return `${API_URL}/image/${id}`;
    }
    
    console.warn("Article missing ID:", article);
    return "https://placehold.co/600x400/eee/aaa?text=News";
  }
  
  // Function to handle contact form submission
  async function handleContactSubmit(e) {
    e.preventDefault();
    
    if (contactSubmitting) return;
    
    try {
      contactSubmitting = true;
      contactResult = null;
      
      // In a real app, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form on success
      contactName = '';
      contactEmail = '';
      contactMessage = '';
      contactResult = { success: true, message: 'Your message has been sent!' };
      
    } catch (err) {
      console.error('Error submitting contact form:', err);
      contactResult = { success: false, message: 'Failed to send message. Please try again.' };
    } finally {
      contactSubmitting = false;
    }
  }

  // Load data when component mounts
  onMount(async () => {
    try {
      loading = true;
      
      // Fetch data in parallel
      const [featured, latest] = await Promise.all([
        fetchFeaturedArticles(),
        fetchLatestArticles()
      ]);
      
      // Log raw featured articles from API
      console.log('Raw featured articles from API:', featured);
      featured.forEach(article => {
        console.log(`Article ${article.articleId} has image:`, !!article.image);
      });
      
      // Format articles to match the expected structure
      featuredArticles = featured.map(article => debugArticleData({
        id: article.articleId,
        title: article.title,
        excerpt: article.summary,
        image: getImageUrl(article),
        category: article.category,
        date: new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
      
      latestNews = latest.map(article => ({
        id: article.articleId,
        title: article.title,
        category: article.category,
        date: new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
      
    } catch (err) {
      console.error('Error loading data:', err);
      error = 'Failed to load content. Please try again later.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Political Gossips - Latest Political News and Analysis</title>
</svelte:head>

<div class="container">
  <!-- Integrated NavBar component -->
  <NavBar brand="Political Gossips" links={navLinks} sticky={true} />
  
  <main>
    <!-- Top section: Featured Articles -->
    <section class="featured-section glass-panel">
      <h2>Featured Articles</h2>
      
      {#if error}
        <div class="error-message glass-card">
          <p>{error}</p>
        </div>
      {:else if loading}
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading featured articles...</p>
        </div>
      {:else if featuredArticles.length === 0}
        <div class="empty-state glass-card">
          <p>No featured articles available at this time.</p>
        </div>
      {:else}
        <div class="featured-grid">
          {#each featuredArticles as article}
            <div class="article-card glass-card">
              <img 
                src={article.image} 
                alt={article.title} 
                crossorigin="anonymous"
                on:error={(e) => e.target.src = "https://placehold.co/600x400/eee/aaa?text=News"}
              />
              <div class="article-content">
                <div class="article-meta">
                  <span class="category">{article.category}</span>
                  <span class="date">{article.date}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`} class="read-more">Read More</a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Middle section: Latest News -->
    <section class="latest-news-section glass-panel">
      <h2>Latest News</h2>
      
      {#if error}
        <div class="error-message glass-card">
          <p>{error}</p>
        </div>
      {:else if loading}
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading latest news...</p>
        </div>
      {:else if latestNews.length === 0}
        <div class="empty-state glass-card">
          <p>No latest news available at this time.</p>
        </div>
      {:else}
        <div class="news-list">
          {#each latestNews as article}
            <div class="news-item glass-card">
              <div class="article-meta">
                <span class="category">{article.category}</span>
                <span class="date">{article.date}</span>
              </div>
              <h3><a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>{article.title}</a></h3>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Bottom section: Contact Us -->
    <section class="contact-section glass-panel">
      <h2>Contact Us</h2>
      <div class="contact-content glass-card">
        <p>Have a tip or feedback? We'd love to hear from you.</p>
        
        {#if contactResult}
          <div class="message-result {contactResult.success ? 'success' : 'error'}">
            {contactResult.message}
          </div>
        {/if}
        
        <form class="contact-form" on:submit={handleContactSubmit}>
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Your Name" 
              required
              bind:value={contactName}
              disabled={contactSubmitting}
            />
          </div>
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Your Email" 
              required
              bind:value={contactEmail}
              disabled={contactSubmitting}
            />
          </div>
          <div class="form-group">
            <textarea 
              placeholder="Your Message" 
              rows="4" 
              required
              bind:value={contactMessage}
              disabled={contactSubmitting}
            ></textarea>
          </div>
          <button 
            type="submit" 
            class="submit-btn"
            disabled={contactSubmitting}
          >
            {contactSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  </main>

  <footer class="glass-panel">
    <div class="copyright">
      &copy; {new Date().getFullYear()} Political Gossips. All rights reserved.
    </div>
  </footer>
</div>

<style>
  /* Replace your existing body styles */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: var(--text-secondary);
    background: var(--background-gradient);
    background-attachment: fixed;
    min-height: 100vh;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 20px 40px;
  }
  
  /* Update your glass-panel style */
  .glass-panel {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    padding: 2rem;
    margin-bottom: 2.5rem;
  }
  
  /* Update glass-card style */
  .glass-card {
    background: var(--glass-card-bg);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--card-hover-shadow);
  }
  
  /* Featured grid layout */
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  /* Article card image container */
  .article-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    object-position: center;
    display: block;
    aspect-ratio: 16/9;
  }
  
  /* Article content container */
  .article-content {
    padding: 1.25rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Article metadata styling */
  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  /* Update typography */
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 0;
    margin-bottom: 1.5rem;
    position: relative;
    display: inline-block;
  }
  
  h2::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: var(--text-primary);
    border-radius: 2px;
  }
  
  /* Update article-card styles */
  .article-card h3 {
    margin: 0 0 0.8rem;
    font-size: 1.2rem;
    line-height: 1.4;
    color: var(--text-primary);
  }
  
  .article-card p {
    margin-bottom: 1.2rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    /* Add ellipsis for text overflow */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Update category styles */
  .category {
    color: var(--text-primary);
    font-weight: 600;
    background: var(--category-bg);
    padding: 0.3rem 0.7rem;
    border-radius: 50px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
  
  .date {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
  
  /* Update read-more button */
  .read-more {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.3s, transform 0.2s;
    margin-top: auto; /* Push to bottom of flex container */
    align-self: flex-start;
  }
  
  .read-more:hover {
    background-color: var(--text-primary);
    transform: translateY(-2px);
  }
  
  /* Latest news section */
  .news-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .news-item {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .news-item h3 {
    margin: 0.5rem 0 0;
    font-size: 1.1rem;
  }
  
  /* Update news-item links */
  .news-item h3 a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .news-item h3 a:hover {
    color: var(--accent-color);
  }
  
  /* Contact form styling */
  .contact-content {
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .contact-form {
    display: grid;
    gap: 1rem;
  }
  
  /* Update form fields */
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--glass-border);
    background: var(--glass-card-bg);
    border-radius: 4px;
    color: var(--text-primary);
    font-family: inherit;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  /* Update submit button */
  .submit-btn {
    padding: 0.8rem 1.5rem;
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    font-weight: 500;
  }
  
  .submit-btn:hover:not(:disabled) {
    background: var(--text-primary);
    transform: translateY(-2px);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  /* Update message results */
  .message-result {
    padding: 0.8rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .message-result.success {
    background-color: var(--success-bg);
    color: var(--success-text);
  }
  
  .message-result.error {
    background-color: var(--error-bg);
    color: var(--error-text);
  }
  
  /* Update footer */
  footer {
    text-align: center;
    padding: 1.5rem;
  }
  
  .copyright {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  /* Loading spinner */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Update error message */
  .error-message {
    padding: 1.5rem;
    color: var(--error-text);
    background-color: var(--error-bg);
    text-align: center;
    border-radius: 8px;
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 60px 16px 24px;
    }
    
    .glass-panel {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .featured-grid {
      grid-template-columns: 1fr;
    }
    
    .news-list {
      grid-template-columns: 1fr;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    .article-card img {
      height: 180px;
    }
  }
  
  @media (max-width: 480px) {
    .glass-panel {
      padding: 1rem;
      border-radius: 8px;
    }
    
    .article-content {
      padding: 1rem;
    }
    
    .article-card h3 {
      font-size: 1.1rem;
    }
    
    .category {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
    }
    
    .date {
      font-size: 0.8rem;
    }
  }
</style>