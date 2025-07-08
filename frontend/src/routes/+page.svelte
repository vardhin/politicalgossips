<script>
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { theme } from './../lib/stores/theme';
  import './../lib/styles/theme.css';
  import NavBar from './../lib/components/NavBar.svelte';

  // Simplified categories
  const categories = ["General", "Political"];
  
  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "HOME", active: true },
    { href: "/category/general", label: "GENERAL", active: false },
    { href: "/category/political", label: "POLITICAL", active: false },
    { href: "/contact", label: "CONTACT US", active: false },
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

  // Add reactive statement to update body class
  $: {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', $theme === 'dark');
    }
  }

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
      const response = await fetch(`${API_URL}/articles/latest?limit=6`);
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
    if (!article) return "https://placehold.co/800x450/1a1a1a/ffffff?text=Breaking+News";
    
    // Ensure articleId exists and is valid
    if (article.articleId || article.id) {
      const id = article.articleId || article.id;
      return `${API_URL}/image/${id}`;
    }
    
    console.warn("Article missing ID:", article);
    return "https://placehold.co/800x450/1a1a1a/ffffff?text=Breaking+News";
  }

  // Function to truncate text to 2 lines
  function truncateToTwoLines(text, maxLength = 120) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
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
      
      // Set initial body class
      document.body.classList.toggle('dark', $theme === 'dark');
      
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
        summary: truncateToTwoLines(article.summary),
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

<div class="site-wrapper" class:dark={$theme === 'dark'}>
  <!-- Integrated NavBar component -->
  <NavBar brand="POLITICAL GOSSIPS" links={navLinks} sticky={true} />
  
  <main class="main-content">
    <!-- Hero Section with Featured Story -->
    {#if featuredArticles.length > 0}
      <section class="hero-section">
        <div class="hero-article">
          <div class="hero-content-wrapper">
            <div class="hero-image-container">
              <img 
                src={featuredArticles[0].image} 
                alt={featuredArticles[0].title}
                class="hero-image"
                on:error={(e) => e.target.src = "https://placehold.co/600x400/2c2c2c/ffffff?text=INVESTIGATION"}
              />
            </div>
            <div class="hero-text-content">
              <div class="breaking-badge">BREAKING</div>
              <span class="hero-category">{featuredArticles[0].category}</span>
              <h1 class="hero-title">{featuredArticles[0].title}</h1>
              <p class="hero-excerpt">{featuredArticles[0].excerpt}</p>
              <div class="hero-meta">
                <span class="hero-date">{featuredArticles[0].date}</span>
                <a href={`/article?id=${featuredArticles[0].id}&slug=${slugify(featuredArticles[0].title)}`} class="hero-cta">READ MORE</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <div class="content-grid">
      <!-- Main Content Area -->
      <div class="main-column">
        <!-- Featured Articles Grid -->
        <section class="featured-section">
          <div class="section-header">
            <h2 class="section-title">FEATURED NEWS</h2>
            <div class="section-divider"></div>
          </div>
          
          {#if error}
            <div class="error-message">
              <h3>Unable to Load Content</h3>
              <p>{error}</p>
            </div>
          {:else if loading}
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading investigative reports...</p>
            </div>
          {:else if featuredArticles.length === 0}
            <div class="empty-state">
              <h3>No Reports Available</h3>
              <p>Check back for the latest investigative journalism and political exposés.</p>
            </div>
          {:else}
            <div class="featured-grid">
              {#each featuredArticles.slice(1) as article}
                <article class="news-card">
                  <div class="news-card-content">
                    <div class="news-image-container">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        class="news-image"
                        on:error={(e) => e.target.src = "https://placehold.co/400x250/2c2c2c/ffffff?text=REPORT"}
                      />
                      <div class="news-overlay">
                        <span class="news-category">{article.category}</span>
                      </div>
                    </div>
                    <div class="news-content">
                      <h3 class="news-title">
                        <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>{article.title}</a>
                      </h3>
                      <p class="news-excerpt">{article.excerpt}</p>
                      <div class="news-meta">
                        <time class="news-date">{article.date}</time>
                        <span class="read-time">5 min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Latest News -->
        <section class="sidebar-section">
          <div class="section-header">
            <h3 class="sidebar-title">LATEST NEWS</h3>
            <div class="section-divider"></div>
          </div>
          
          {#if latestNews.length > 0}
            <div class="sidebar-news-list">
              {#each latestNews as article}
                <article class="sidebar-news-item">
                  <div class="sidebar-news-meta">
                    <span class="sidebar-category">{article.category}</span>
                    <time class="sidebar-date">{article.date}</time>
                  </div>
                  <h4 class="sidebar-news-title">
                    <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>{article.title}</a>
                  </h4>
                  <p class="sidebar-news-summary">{article.summary}</p>
                </article>
              {/each}
            </div>
          {/if}
        </section>

        <!-- Add Investigation Tips Box -->
        <section class="sidebar-section tips-section">
          <div class="section-header">
            <h3 class="sidebar-title">SECURE TIPS</h3>
            <div class="section-divider"></div>
          </div>
          <div class="tips-content">
            <p>Have information about corruption or misconduct?</p>
            <a href="/contact" class="tips-button">SUBMIT SECURELY</a>
          </div>
        </section>
      </aside>
    </div>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="section-header">
        <h2 class="section-title">CONTACT US</h2>
        <div class="section-divider"></div>
      </div>
      
      <div class="contact-container">
        <div class="contact-info">
          <h3>Confidential Sources</h3>
          <p>Our investigative team is committed to protecting whistleblowers and sources. All communications are handled with the highest level of security and confidentiality.</p>
          <div class="contact-methods">
            <div class="contact-method">
              <strong>Encrypted Email:</strong> investigations@politicalgossips.com
            </div>
            <div class="contact-method">
              <strong>Secure Line:</strong> +1 (555) 123-TIPS
            </div>
            <div class="contact-method">
              <strong>Signal:</strong> +1 (555) 123-7477
            </div>
          </div>
        </div>
        
        <div class="contact-form-container">
          {#if contactResult}
            <div class="message-result {contactResult.success ? 'success' : 'error'}">
              {contactResult.message}
            </div>
          {/if}
          
          <form class="contact-form" on:submit={handleContactSubmit}>
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name (Optional)</label>
                <input 
                  type="text" 
                  id="name"
                  bind:value={contactName}
                  disabled={contactSubmitting}
                  placeholder="Anonymous allowed"
                />
              </div>
              <div class="form-group">
                <label for="email">Contact (Optional)</label>
                <input 
                  type="email" 
                  id="email"
                  bind:value={contactEmail}
                  disabled={contactSubmitting}
                  placeholder="For follow-up only"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="message">Information</label>
              <textarea 
                id="message"
                rows="6" 
                required
                bind:value={contactMessage}
                disabled={contactSubmitting}
                placeholder="Describe the situation, provide evidence details, or share your concerns..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              class="submit-btn"
              disabled={contactSubmitting}
            >
              {contactSubmitting ? 'SENDING...' : 'SUBMIT INFORMATION'}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Political Gossips</h4>
        <p>Independent investigative journalism exposing political corruption and holding power accountable.</p>
      </div>
      <div class="footer-section">
        <h4>Investigations</h4>
        <ul class="footer-links">
          <li><a href="/category/political">Political Corruption</a></li>
          <li><a href="/category/general">Government Oversight</a></li>
          <li><a href="/archives">Investigation Archives</a></li>
          <li><a href="/methodology">Our Methods</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Transparency</h4>
        <ul class="footer-links">
          <li><a href="/about">About Our Team</a></li>
          <li><a href="/ethics">Ethics Policy</a></li>
          <li><a href="/funding">Funding Sources</a></li>
          <li><a href="/corrections">Corrections</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copyright">
        &copy; {new Date().getFullYear()} Political Gossips. Independent journalism in the public interest.
      </div>
    </div>
  </footer>
</div>

<style>
  /* Global Styles - More serious typography */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    font-size: 16px;
    transition: background-color 0.3s ease, color 0.3s ease;
    background-color: #fafafa;
    color: #1a1a1a;
    font-weight: 400;
  }

  /* Dark theme for body */
  :global(body.dark) {
    background-color: #0f0f0f;
    color: #e5e5e5;
  }

  /* CSS Custom Properties - More serious color scheme */
  .site-wrapper {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --bg-tertiary: #e8e8e8;
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --text-tertiary: #666666;
    --text-muted: #888888;
    --border-color: #d0d0d0;
    --border-light: #e8e8e8;
    --shadow-light: rgba(0, 0, 0, 0.05);
    --shadow-medium: rgba(0, 0, 0, 0.1);
    --shadow-heavy: rgba(0, 0, 0, 0.2);
    --accent-color: #d73027;
    --accent-hover: #b71c1c;
    --warning-color: #f57c00;
    --success-bg: #e8f5e8;
    --success-text: #2e7d32;
    --success-border: #4caf50;
    --error-bg: #ffebee;
    --error-text: #c62828;
    --error-border: #e57373;
    
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: 80px;
    transition: all 0.3s ease;
  }

  /* Dark theme overrides */
  .site-wrapper.dark {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #2a2a2a;
    --text-primary: #e5e5e5;
    --text-secondary: #b8b8b8;
    --text-tertiary: #888888;
    --text-muted: #666666;
    --border-color: #333333;
    --border-light: #2a2a2a;
    --shadow-light: rgba(0, 0, 0, 0.3);
    --shadow-medium: rgba(0, 0, 0, 0.5);
    --shadow-heavy: rgba(0, 0, 0, 0.7);
    --accent-color: #ef5350;
    --accent-hover: #d32f2f;
    --warning-color: #ff9800;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 20px;
  }

  /* Hero Section - More newspaper-like */
  .hero-section {
    margin: 20px 0 40px;
    border-bottom: 3px solid var(--accent-color);
    padding-bottom: 30px;
  }

  .hero-article {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 10px var(--shadow-light);
  }

  .hero-content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 0;
    min-height: 400px;
  }

  .hero-image-container {
    position: relative;
    overflow: hidden;
    order: 1;
  }

  .hero-text-content {
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    order: 2;
  }

  .breaking-badge {
    display: inline-block;
    background: var(--accent-color);
    color: white;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 2px;
    margin-bottom: 15px;
    width: fit-content;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0.7; }
  }

  .hero-category {
    display: block;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
  }

  .hero-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 20px;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .hero-excerpt {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 25px;
    line-height: 1.6;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 25px;
    margin-top: auto;
  }

  .hero-date {
    color: var(--text-tertiary);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hero-cta {
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 12px 24px;
    text-decoration: none;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    border: 2px solid var(--text-primary);
  }

  .hero-cta:hover {
    background: var(--accent-color);
    border-color: var(--accent-color);
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: grayscale(20%);
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 50px;
    margin-bottom: 50px;
  }

  /* Section Headers - More authoritative */
  .section-header {
    margin-bottom: 30px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 15px;
  }

  .section-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .section-divider {
    width: 80px;
    height: 3px;
    background: var(--accent-color);
    border: none;
    margin-top: 10px;
  }

  /* Featured Grid - New mini hero card style */
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  /* News Cards - Mini hero card style */
  .news-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px var(--shadow-light);
  }

  .news-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium);
    transform: translateY(-2px);
  }

  .news-card-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    min-height: 180px;
  }

  .news-image-container {
    position: relative;
    overflow: hidden;
    order: 1;
  }

  .news-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: grayscale(30%);
    transition: filter 0.3s ease;
  }

  .news-card:hover .news-image {
    filter: grayscale(0%);
  }

  .news-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7));
    display: flex;
    align-items: flex-end;
    padding: 10px;
  }

  .news-category {
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-primary);
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .news-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    order: 2;
  }

  .news-title {
    margin: 0 0 10px;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .news-title a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .news-title a:hover {
    color: var(--accent-color);
  }

  .news-excerpt {
    color: var(--text-secondary);
    margin: 0 0 15px;
    font-size: 0.85rem;
    line-height: 1.4;
    flex: 1;
  }

  .news-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-light);
    padding-top: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: auto;
  }

  .news-date {
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .read-time {
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Sidebar - More serious styling */
  .sidebar {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    height: fit-content;
  }

  .sidebar-section {
    padding: 30px;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-section:last-child {
    border-bottom: none;
  }

  .sidebar-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Tips Section */
  .tips-section {
    background: var(--bg-tertiary);
  }

  .tips-content p {
    color: var(--text-secondary);
    margin: 0 0 20px;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .tips-button {
    display: inline-block;
    background: var(--accent-color);
    color: white;
    padding: 12px 20px;
    text-decoration: none;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: background-color 0.3s ease;
  }

  .tips-button:hover {
    background: var(--accent-hover);
  }

  /* Sidebar News Items */
  .sidebar-news-list {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .sidebar-news-item {
    padding-bottom: 25px;
    border-bottom: 1px solid var(--border-light);
  }

  .sidebar-news-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .sidebar-news-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
  }

  .sidebar-category {
    background: var(--text-tertiary);
    color: white;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sidebar-date {
    color: var(--text-tertiary);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .sidebar-news-title {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .sidebar-news-title a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .sidebar-news-title a:hover {
    color: var(--accent-color);
  }

  .sidebar-news-summary {
    color: var(--text-muted);
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0;
  }

  /* Contact Section - More professional */
  .contact-section {
    background: var(--bg-secondary);
    padding: 50px 40px;
    margin: 50px 0;
    border: 1px solid var(--border-color);
    border-top: 3px solid var(--accent-color);
  }

  .contact-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    margin-top: 30px;
  }

  .contact-info h3 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 15px;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .contact-info p {
    color: var(--text-secondary);
    margin: 0 0 25px;
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .contact-methods {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .contact-method {
    color: var(--text-primary);
    font-size: 0.9rem;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
  }

  .contact-method strong {
    color: var(--accent-color);
    font-weight: 600;
  }

  /* Contact Form - More secure looking */
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-group input,
  .form-group textarea {
    padding: 14px;
    border: 2px solid var(--border-color);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s ease;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .submit-btn {
    background: var(--text-primary);
    color: var(--bg-primary);
    border: none;
    padding: 18px 35px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 13px;
    align-self: flex-start;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--accent-color);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Message Results */
  .message-result {
    padding: 20px;
    margin-bottom: 25px;
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .message-result.success {
    background: var(--success-bg);
    color: var(--success-text);
    border-left: 4px solid var(--success-border);
  }

  .message-result.error {
    background: var(--error-bg);
    color: var(--error-text);
    border-left: 4px solid var(--error-border);
  }

  /* Footer - More authoritative */
  .site-footer {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 50px 0 25px;
    margin-top: auto;
    border-top: 3px solid var(--accent-color);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
  }

  .footer-section h4 {
    font-size: 1rem;
    font-weight: 800;
    margin: 0 0 20px;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .footer-section p {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li {
    margin-bottom: 10px;
  }

  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .footer-links a:hover {
    color: var(--accent-color);
  }

  .footer-bottom {
    border-top: 1px solid var(--border-color);
    margin-top: 40px;
    padding-top: 25px;
    text-align: center;
  }

  .copyright {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Loading States */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    background: var(--error-bg);
    color: var(--error-text);
    padding: 40px;
    border-left: 4px solid var(--error-border);
    text-align: center;
  }

  .error-message h3 {
    margin: 0 0 15px;
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .empty-state {
    background: var(--bg-secondary);
    padding: 50px;
    border: 1px solid var(--border-color);
    text-align: center;
  }

  .empty-state h3 {
    margin: 0 0 15px;
    color: var(--text-primary);
    font-weight: 700;
    text-transform: uppercase;
  }

  .empty-state p {
    color: var(--text-muted);
    margin: 0;
  }

  /* Responsive Design Updates */
  @media (max-width: 768px) {
    .hero-content-wrapper {
      grid-template-columns: 1fr;
    }

    .hero-image-container {
      order: 1;
      min-height: 200px;
    }

    .hero-text-content {
      order: 2;
      padding: 30px 25px;
    }

    .featured-grid {
      grid-template-columns: 1fr;
    }

    .news-card-content {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .news-image-container {
      order: 1;
      min-height: 150px;
    }

    .news-content {
      order: 2;
    }
  }

  @media (max-width: 480px) {
    .news-card-content {
      display: block;
    }

    .news-image-container {
      height: 140px;
    }
  }
</style>