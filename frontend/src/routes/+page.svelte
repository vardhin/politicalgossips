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
  let usingFallback = false; // Track if we're using fallback data
  let retryInterval = null; // Store interval reference for cleanup

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

  // Function to fetch featured articles with retry capability
  async function fetchFeaturedArticles() {
    try {
      const response = await fetch(`${API_URL}/articles/featured`);
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (data.length > 0) {
        usingFallback = false;
        return data;
      }
      throw new Error('No data received');
    } catch (err) {
      console.warn('Using fallback featured articles:', err.message);
      usingFallback = true;
      return fallbackFeaturedArticles;
    }
  }

  // Function to fetch latest articles with retry capability
  async function fetchLatestArticles() {
    try {
      const response = await fetch(`${API_URL}/articles/latest?limit=6`);
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (data.length > 0) {
        usingFallback = false;
        return data;
      }
      throw new Error('No data received');
    } catch (err) {
      console.warn('Using fallback latest articles:', err.message);
      usingFallback = true;
      return fallbackLatestNews;
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

  // Add fallback data for better UX
  const fallbackFeaturedArticles = [
    {
      id: 'fallback-1',
      title: 'Political Accountability in Focus',
      excerpt: 'Exploring the latest developments in government transparency and political oversight.',
      image: "https://placehold.co/800x450/1a1a1a/ffffff?text=Breaking+News",
      category: 'Political',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    {
      id: 'fallback-2',
      title: 'Investigative Report Update',
      excerpt: 'Stay informed with our ongoing investigations into governmental affairs.',
      image: "https://placehold.co/800x450/1a1a1a/ffffff?text=Investigation",
      category: 'General',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  ];

  const fallbackLatestNews = [
    {
      id: 'latest-1',
      title: 'Daily Political Brief',
      category: 'Political',
      summary: 'Your essential daily update on political developments and government activities.',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    {
      id: 'latest-2',
      title: 'Government Watch',
      category: 'General',
      summary: 'Monitoring government actions and policy changes that affect citizens.',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  ];

  // Function to load articles (can be called multiple times)
  async function loadArticles() {
    try {
      loading = true;
      
      const [featured, latest] = await Promise.all([
        fetchFeaturedArticles(),
        fetchLatestArticles()
      ]);
      
      // Format articles to match the expected structure
      featuredArticles = featured.map(article => ({
        id: article.articleId || article.id,
        title: article.title,
        excerpt: article.summary || article.excerpt,
        image: getImageUrl(article),
        category: article.category,
        date: article.date ? new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : article.date
      }));
      
      latestNews = latest.map(article => ({
        id: article.articleId || article.id,
        title: article.title,
        category: article.category,
        summary: truncateToTwoLines(article.summary),
        date: article.date ? new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : article.date
      }));

      // If we successfully loaded real data and were using fallback, clear retry interval
      if (!usingFallback && retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
        console.log('Successfully loaded real data, stopped retrying');
      }
      
    } catch (err) {
      console.warn('Loading fallback content:', err);
      usingFallback = true;
      featuredArticles = fallbackFeaturedArticles;
      latestNews = fallbackLatestNews;
    } finally {
      loading = false;
      error = null;
    }
  }

  // Function to start retry mechanism
  function startRetryMechanism() {
    if (retryInterval) return; // Don't create multiple intervals
    
    // Retry every 30 seconds if using fallback data
    retryInterval = setInterval(async () => {
      if (usingFallback) {
        console.log('Retrying API calls...');
        await loadArticles();
      } else {
        // If we're not using fallback anymore, stop retrying
        clearInterval(retryInterval);
        retryInterval = null;
      }
    }, 30000); // 30 seconds
  }

  // Updated onMount with retry mechanism
  onMount(async () => {
    // Set initial body class
    document.body.classList.toggle('dark', $theme === 'dark');
    
    // Load articles initially
    await loadArticles();
    
    // Start retry mechanism if we're using fallback data
    if (usingFallback) {
      startRetryMechanism();
    }
    
    // Cleanup function
    return () => {
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    };
  });
</script>

<svelte:head>
  <title>Political Gossips - Latest Political News and Analysis</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                on:error={(e) => e.target.src = "https://placehold.co/600x400/2c2c2c/ffffff?text=NEWS"}
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
          
          {#if loading}
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading latest reports...</p>
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
                        {#if usingFallback}
                          <span class="fallback-indicator">DEMO</span>
                        {/if}
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
  </main>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Political Gossips</h4>
        <p>Independent investigative journalism exposing political corruption and holding power accountable.</p>
      </div>
    <div class="footer-bottom">
      <div class="copyright">
        &copy; {new Date().getFullYear()} Political Gossips. Independent journalism in the public interest.
      </div>
    </div>
  </footer>
</div>

<!-- Remove error-related styles from CSS since we're not showing errors -->
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
    /* Prevent horizontal scrolling */
    overflow-x: hidden;
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
    width: 100%;
    box-sizing: border-box;
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
    padding: 0 15px;
    box-sizing: border-box;
  }

  /* Hero Section - Mobile optimized */
  .hero-section {
    margin: 20px 0 30px;
    border-bottom: 3px solid var(--accent-color);
    padding-bottom: 20px;
  }

  .hero-article {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 10px var(--shadow-light);
    border-radius: 0;
    overflow: hidden;
  }

  .hero-content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 0;
    min-height: 350px;
  }

  .hero-image-container {
    position: relative;
    overflow: hidden;
    order: 1;
  }

  .hero-text-content {
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    order: 2;
  }

  .breaking-badge {
    display: inline-block;
    background: var(--accent-color);
    color: white;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
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
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .hero-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 15px;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .hero-excerpt {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0 0 20px;
    line-height: 1.5;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: auto;
    flex-wrap: wrap;
  }

  .hero-date {
    color: var(--text-tertiary);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hero-cta {
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 10px 20px;
    text-decoration: none;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    border: 2px solid var(--text-primary);
    white-space: nowrap;
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

  /* Content Grid - Mobile responsive */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    margin-bottom: 40px;
  }

  /* Desktop layout for content grid */
  @media (min-width: 768px) {
    .content-grid {
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }
  }

  /* Featured Grid - Full width list layout */
  .featured-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* News Cards - Full width list item layout */
  .news-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px var(--shadow-light);
    width: 100%;
  }

  .news-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium);
  }

  .news-card-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 0;
    min-height: 200px;
    height: 100%;
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
    filter: grayscale(20%);
    transition: filter 0.3s ease;
  }

  .news-card:hover .news-image {
    filter: grayscale(0%);
  }

  .news-overlay {
    position: absolute;
    top: 15px;
    left: 15px;
    display: flex;
    gap: 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .news-category {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .news-content {
    padding: 25px 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    order: 2;
  }

  .news-title {
    margin: 0 0 15px;
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
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
    margin: 0 0 20px;
    font-size: 1rem;
    line-height: 1.5;
    flex: 1;
  }

  .news-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: auto;
    flex-wrap: wrap;
  }

  .news-date {
    color: var(--text-tertiary);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .read-time {
    color: var(--text-muted);
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 767px) {
    .news-card-content {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    
    .news-image-container {
      height: 200px;
      order: 0;
    }
    
    .news-content {
      order: 1;
      padding: 20px;
    }
    
    .news-title {
      font-size: 1.1rem;
    }
    
    .news-excerpt {
      font-size: 0.9rem;
    }
  }

  /* Desktop responsive adjustments */
  @media (min-width: 768px) and (max-width: 1024px) {
    .news-card-content {
      grid-template-columns: 250px 1fr;
    }
  }

  @media (min-width: 1025px) {
    .news-card-content {
      grid-template-columns: 300px 1fr;
    }
  }

  /* Tips Section */
  .tips-section {
    background: var(--bg-tertiary);
  }

  .tips-content p {
    color: var(--text-secondary);
    margin: 0 0 15px;
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
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }

  .tips-button:hover {
    background: var(--accent-hover);
  }

  /* Sidebar News Items */
  .sidebar-news-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar-news-item {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .sidebar-news-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .sidebar-news-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
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
    margin: 0 0 8px;
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

  /* Footer - Mobile optimized */
  .site-footer {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 40px 0 20px;
    margin-top: auto;
    border-top: 3px solid var(--accent-color);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-section h4 {
    font-size: 1rem;
    font-weight: 800;
    margin: 0 0 15px;
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
    margin-bottom: 8px;
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
    margin-top: 30px;
    padding-top: 20px;
    text-align: center;
  }

  .copyright {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 10px;
  }

  /* Loading States */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 35px;
    height: 35px;
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Add visual indicator for fallback mode */
  .fallback-indicator {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--warning-color);
    color: white;
    padding: 4px 8px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>