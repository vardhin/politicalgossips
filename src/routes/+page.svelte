<script>
  import { onMount } from 'svelte';
  import NavBar from './../lib/components/NavBar.svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  
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

  // Using environment variable for API URL
  const API_URL = PUBLIC_API_URL;

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

  // Load data when component mounts
  onMount(async () => {
    try {
      loading = true;
      
      // Fetch data in parallel
      const [featured, latest] = await Promise.all([
        fetchFeaturedArticles(),
        fetchLatestArticles()
      ]);
      
      // Format articles to match the expected structure
      featuredArticles = featured.map(article => ({
        id: article.articleId,
        title: article.title,
        excerpt: article.summary,
        image: article.image || "https://placehold.co/600x400/eee/aaa?text=News",
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
              <img src={article.image} alt={article.title} />
              <div class="article-content">
                <div class="article-meta">
                  <span class="category">{article.category}</span>
                  <span class="date">{article.date}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href={`/article/${article.id}`} class="read-more">Read More</a>
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
              <h3><a href={`/article/${article.id}`}>{article.title}</a></h3>
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
        <form class="contact-form">
          <div class="form-group">
            <input type="text" placeholder="Your Name" required />
          </div>
          <div class="form-group">
            <input type="email" placeholder="Your Email" required />
          </div>
          <div class="form-group">
            <textarea placeholder="Your Message" rows="4" required></textarea>
          </div>
          <button type="submit" class="submit-btn">Send Message</button>
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
  /* Base styles */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 20px 40px;
  }
  
  /* Glassmorphic styles */
  .glass-panel {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    margin-bottom: 2.5rem;
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  /* Typography */
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #2c3e50;
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
    background-color: #2c3e50;
    border-radius: 2px;
  }
  
  /* Featured Articles section */
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .article-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .article-content {
    padding: 1.2rem;
  }
  
  .article-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .category {
    color: #2c3e50;
    font-weight: 600;
  }
  
  .date {
    color: #666;
  }
  
  .article-card h3 {
    margin: 0 0 0.8rem;
    font-size: 1.2rem;
    line-height: 1.4;
  }
  
  .article-card p {
    margin-bottom: 1.2rem;
    color: #555;
    font-size: 0.95rem;
  }
  
  .read-more {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: rgba(44, 62, 80, 0.85);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.3s;
  }
  
  .read-more:hover {
    background-color: rgba(44, 62, 80, 1);
  }
  
  /* Latest News section */
  .news-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .news-item {
    padding: 1.2rem;
  }
  
  .news-item h3 {
    margin: 0.5rem 0 0;
    font-size: 1.1rem;
  }
  
  .news-item h3 a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .news-item h3 a:hover {
    color: #2c3e50;
  }
  
  /* Contact section */
  .contact-content {
    padding: 2rem;
  }
  
  .contact-form {
    margin-top: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #333;
    font-family: inherit;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: rgba(44, 62, 80, 0.5);
  }
  
  .submit-btn {
    padding: 0.8rem 1.5rem;
    background: rgba(44, 62, 80, 0.85);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-weight: 500;
  }
  
  .submit-btn:hover {
    background: rgba(44, 62, 80, 1);
  }
  
  /* Footer */
  footer {
    text-align: center;
    padding: 1.5rem;
  }
  
  .copyright {
    font-size: 0.9rem;
    color: #555;
  }
  
  /* Responsive adjustments */
  @media (max-width: 900px) {
    .featured-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .news-list {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 600px) {
    .featured-grid {
      grid-template-columns: 1fr;
    }
    
    .container {
      padding: 70px 15px 30px;
    }
    
    .glass-panel {
      padding: 1.5rem;
    }
  }
  
  /* Loading state styles */
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
    border: 4px solid rgba(44, 62, 80, 0.1);
    border-radius: 50%;
    border-top: 4px solid rgba(44, 62, 80, 0.8);
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error and empty states */
  .error-message {
    padding: 1.5rem;
    color: #721c24;
    background-color: rgba(248, 215, 218, 0.7);
    text-align: center;
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #555;
  }
</style>