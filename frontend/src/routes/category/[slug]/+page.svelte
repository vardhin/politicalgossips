<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from '../../../lib/components/NavBar.svelte';
  import { theme } from '../../../lib/stores/theme';

  // Get the category from the URL parameter
  $: category = $page.params.slug;
  
  // Navigation links - update active state based on current category
  $: navLinks = [
    { href: "/", label: "HOME", active: false },
    { href: "/category/general", label: "GENERAL", active: category === 'general' },
    { href: "/category/political", label: "POLITICAL", active: category === 'political' },
    { href: "/contact", label: "CONTACT US", active: false },
  ];

  let articles = [];
  let featuredArticle = null;
  let latestSidebar = [];
  let loading = true;
  let error = null;
  let searchQuery = '';

  // Add reactive statement to update body class
  $: {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', $theme === 'dark');
    }
  }

  // Function to fetch articles by category
  async function fetchCategoryArticles(categoryName, search = '') {
    try {
      loading = true;
      error = null;
      
      // Build URL with search parameter if provided
      let url = `${PUBLIC_API_URL}/articles/category/${categoryName}`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      
      console.log(`Fetching articles from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${categoryName} articles: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received category articles:', data);
      
      // The backend returns an array directly, not an object with articles property
      const articlesArray = Array.isArray(data) ? data : [];
      
      // Format articles to match expected structure
      const formattedArticles = articlesArray.map(article => ({
        id: article.articleId,
        title: article.title,
        excerpt: article.summary,
        category: article.category,
        date: new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        image: `${PUBLIC_API_URL}/image/${article.articleId}`,
        readTime: Math.ceil((article.summary?.length || 0) / 200) || 3
      }));

      // Set featured article (first one) and remaining articles
      if (formattedArticles.length > 0) {
        featuredArticle = formattedArticles[0];
        articles = formattedArticles.slice(1);
      } else {
        featuredArticle = null;
        articles = [];
      }
      
    } catch (err) {
      console.error('Error fetching category articles:', err);
      error = err.message;
      featuredArticle = null;
      articles = [];
    } finally {
      loading = false;
    }
  }

  // Function to fetch latest articles for sidebar
  async function fetchLatestSidebar() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/articles/latest?limit=5`);
      if (!response.ok) {
        console.warn('Failed to fetch sidebar articles');
        return [];
      }
      const data = await response.json();
      
      return data.map(article => ({
        id: article.articleId,
        title: article.title,
        category: article.category,
        date: new Date(article.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }));
    } catch (err) {
      console.error('Error fetching sidebar articles:', err);
      return [];
    }
  }

  // Function to handle search
  async function handleSearch() {
    await fetchCategoryArticles(category, searchQuery);
  }

  // Slugify function
  function slugify(text) {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  // Reactively fetch articles when category changes
  $: if (category) {
    Promise.all([
      fetchCategoryArticles(category),
      fetchLatestSidebar().then(data => latestSidebar = data)
    ]);
  }
</script>

<svelte:head>
  <title>{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category'} News - Political Gossips</title>
  <meta name="description" content="Latest {category} news and political exposés from our independent journalism team." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="site-wrapper" class:dark={$theme === 'dark'}>
  <NavBar brand="POLITICAL GOSSIPS" links={navLinks} sticky={true} />
  
  <main class="main-content">
    <!-- Category Hero Section -->
    <section class="category-hero">
      <div class="category-header">
        <div class="category-breadcrumb">
          <a href="/">HOME</a>
          <span class="separator">→</span>
          <span class="current">{category ? category.toUpperCase() : 'CATEGORY'}</span>
        </div>
        <h1 class="category-title">{category ? category.toUpperCase() : 'CATEGORY'} NEWS</h1>
        <div class="category-subtitle">
          {#if category === 'political'}
            Exposing corruption, tracking money, and holding power accountable
          {:else if category === 'general'}
            In-depth reporting on issues that matter to democracy
          {:else}
            Independent investigative journalism in the public interest
          {/if}
        </div>
        <div class="category-divider"></div>
      </div>

      <!-- Search Controls -->
      <div class="category-controls">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search {category} news..."
            bind:value={searchQuery}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            class="search-input"
          />
          <button on:click={handleSearch} class="search-btn">SEARCH</button>
        </div>
        
        <div class="filter-info">
          <span class="results-count">
            {#if searchQuery}
              {articles.length + (featuredArticle ? 1 : 0)} results found
            {:else}
              {articles.length + (featuredArticle ? 1 : 0)} news available
            {/if}
          </span>
        </div>
      </div>
    </section>

    <div class="content-grid">
      <!-- Main Content Area -->
      <div class="main-column">
        <!-- Featured Article -->
        {#if featuredArticle && !searchQuery}
          <section class="featured-section">
            <div class="section-header">
              <h2 class="section-title">FEATURED NEWS</h2>
              <div class="section-divider"></div>
            </div>
            
            <article class="featured-article">
              <div class="featured-content-wrapper">
                <div class="featured-image-container">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    class="featured-image"
                    on:error={(e) => e.target.src = "https://placehold.co/600x400/2c2c2c/ffffff?text=NEWS"}
                  />
                  <div class="featured-overlay">
                    <span class="featured-badge">EXCLUSIVE</span>
                  </div>
                </div>
                <div class="featured-text-content">
                  <span class="featured-category">{featuredArticle.category}</span>
                  <h3 class="featured-title">{featuredArticle.title}</h3>
                  <p class="featured-excerpt">{featuredArticle.excerpt}</p>
                  <div class="featured-meta">
                    <span class="featured-date">{featuredArticle.date}</span>
                    <span class="read-time">{featuredArticle.readTime} min read</span>
                    <a href={`/article?id=${featuredArticle.id}&slug=${slugify(featuredArticle.title)}`} class="featured-cta">READ MORE</a>
                  </div>
                </div>
              </div>
            </article>
          </section>
        {/if}

        <!-- Articles Grid -->
        <section class="articles-section">
          <div class="section-header">
            <h2 class="section-title">
              {searchQuery ? `SEARCH RESULTS FOR "${searchQuery}"` : `ALL ${category ? category.toUpperCase() : 'CATEGORY'} REPORTS`}
            </h2>
            <div class="section-divider"></div>
          </div>

          {#if loading}
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading {category} News...</p>
            </div>
          {:else if error}
            <div class="error-message">
              <h3>Unable to Load News</h3>
              <p>{error}</p>
              <button on:click={() => fetchCategoryArticles(category)} class="retry-btn">TRY AGAIN</button>
            </div>
          {:else if articles.length === 0 && !featuredArticle}
            <div class="empty-state">
              <h3>No News Found</h3>
              <p>
                {searchQuery ? 
                  `No ${category} articles match your search term "${searchQuery}".` : 
                  `No ${category} News is currently available.`
                }
              </p>
              {#if searchQuery}
                <button on:click={() => { searchQuery = ''; handleSearch(); }} class="clear-search-btn">CLEAR SEARCH</button>
              {/if}
            </div>
          {:else}
            <div class="articles-grid">
              {#each articles as article}
                <article class="article-card">
                  <div class="article-content-wrapper">
                    <div class="article-image-container">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        class="article-image"
                        on:error={(e) => e.target.src = "https://placehold.co/400x250/2c2c2c/ffffff?text=REPORT"}
                      />
                      <div class="article-overlay">
                        <span class="article-category">{article.category}</span>
                      </div>
                    </div>
                    <div class="article-text-content">
                      <h3 class="article-title">
                        <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>{article.title}</a>
                      </h3>
                      <p class="article-excerpt">{article.excerpt}</p>
                      <div class="article-meta">
                        <time class="article-date">{article.date}</time>
                        <span class="read-time">{article.readTime} min read</span>
                        <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`} class="read-more">READ MORE</a>
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
            <h3 class="sidebar-title">LATEST REPORTS</h3>
            <div class="section-divider"></div>
          </div>
          
          {#if latestSidebar.length > 0}
            <div class="sidebar-news-list">
              {#each latestSidebar as article}
                <article class="sidebar-news-item">
                  <div class="sidebar-news-meta">
                    <span class="sidebar-category">{article.category}</span>
                    <time class="sidebar-date">{article.date}</time>
                  </div>
                  <h4 class="sidebar-news-title">
                    <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>{article.title}</a>
                  </h4>
                </article>
              {/each}
            </div>
          {:else}
            <p class="no-sidebar-content">No recent reports available</p>
          {/if}
        </section>

        <!-- Tips Section -->
        <section class="sidebar-section tips-section">
          <div class="section-header">
            <h3 class="sidebar-title">SECURE TIPS</h3>
            <div class="section-divider"></div>
          </div>
          <div class="tips-content">
            <p>Have information about {category === 'political' ? 'political corruption' : 'government misconduct'}?</p>
            <a href="/contact" class="tips-button">SUBMIT SECURELY</a>
          </div>
        </section>

        <!-- Category Info Section -->
        <section class="sidebar-section info-section">
          <div class="section-header">
            <h3 class="sidebar-title">ABOUT {category ? category.toUpperCase() : 'CATEGORY'}</h3>
            <div class="section-divider"></div>
          </div>
          <div class="info-content">
            {#if category === 'political'}
              <p>Our political Gossips team tracks money, exposes corruption, and holds elected officials accountable through rigorous fact-checking and source verification.</p>
            {:else if category === 'general'}
              <p>General News cover a wide range of public interest stories, from government transparency to institutional accountability across all sectors.</p>
            {:else}
              <p>Independent investigative journalism dedicated to serving the public interest and exposing wrongdoing in positions of power.</p>
            {/if}
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
      <div class="footer-section">
        <h4>News</h4>
        <ul class="footer-links">
          <li><a href="/category/political">Political Corruption</a></li>
          <li><a href="/category/general">Government Oversight</a></li>
          <li><a href="/archives">News Archives</a></li>
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
  /* Global Styles - Mobile first approach */
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
    overflow-x: hidden;
  }

  :global(body.dark) {
    background-color: #0f0f0f;
    color: #e5e5e5;
  }

  /* CSS Variables - Consistent theming */
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

  /* Main Content - Mobile first */
  .main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
  }

  /* Category Hero Section - Mobile optimized */
  .category-hero {
    margin: 20px 0 30px;
    border-bottom: 3px solid var(--accent-color);
    padding-bottom: 20px;
  }

  .category-header {
    text-align: center;
    margin-bottom: 25px;
  }

  .category-breadcrumb {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary);
    margin-bottom: 12px;
  }

  .category-breadcrumb a {
    color: var(--text-tertiary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .category-breadcrumb a:hover {
    color: var(--accent-color);
  }

  .separator {
    margin: 0 8px;
  }

  .current {
    color: var(--accent-color);
  }

  .category-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 15px;
    letter-spacing: 1.5px;
    line-height: 1.1;
  }

  .category-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0 0 20px;
    font-weight: 500;
    line-height: 1.4;
    max-width: 100%;
    padding: 0 10px;
  }

  .category-divider {
    width: 80px;
    height: 3px;
    background: var(--accent-color);
    margin: 0 auto;
  }

  /* Search Controls - Mobile optimized */
  .category-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: var(--bg-secondary);
    padding: 20px 15px;
    border: 1px solid var(--border-color);
    margin-bottom: 30px;
  }

  .search-container {
    display: flex;
    gap: 10px;
    width: 100%;
    /* Ensure proper mobile overflow handling */
    min-width: 0;
  }

  .search-input {
    flex: 1;
    padding: 12px 14px;
    border: 2px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
    /* Prevent overflow on mobile */
    min-width: 0;
    width: 100%;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .search-btn {
    background: var(--text-primary);
    color: var(--bg-primary);
    border: none;
    padding: 12px 16px;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    white-space: nowrap;
    /* Ensure button doesn't shrink too much */
    flex-shrink: 0;
  }

  .filter-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .results-count {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary);
  }

  /* Content Grid - Mobile first */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    margin-bottom: 40px;
  }

  /* Section Headers - Mobile optimized */
  .section-header {
    margin-bottom: 25px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 12px;
  }

  .section-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .section-divider {
    width: 60px;
    height: 3px;
    background: var(--accent-color);
    border: none;
    margin-top: 8px;
  }

  /* Featured Article - Mobile first */
  .featured-article {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    overflow: hidden;
    box-shadow: 0 2px 10px var(--shadow-light);
    margin-bottom: 30px;
  }

  .featured-content-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .featured-image-container {
    position: relative;
    overflow: hidden;
    height: 200px;
    order: 1;
  }

  .featured-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(20%);
  }

  .featured-overlay {
    position: absolute;
    top: 15px;
    left: 15px;
  }

  .featured-badge {
    background: var(--accent-color);
    color: white;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .featured-text-content {
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    order: 2;
  }

  .featured-category {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .featured-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 12px;
    line-height: 1.2;
  }

  .featured-excerpt {
    color: var(--text-secondary);
    margin: 0 0 15px;
    line-height: 1.5;
    flex: 1;
    font-size: 0.95rem;
  }

  .featured-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: auto;
    flex-wrap: wrap;
  }

  .featured-date {
    color: var(--text-tertiary);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .read-time {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .featured-cta {
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 8px 16px;
    text-decoration: none;
    font-weight: 700;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: background-color 0.3s ease;
    margin-left: auto;
    white-space: nowrap;
  }

  .featured-cta:hover {
    background: var(--accent-color);
  }

  /* Articles Grid - Mobile first */
  .articles-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  /* Article Cards - Mobile optimized */
  .article-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px var(--shadow-light);
  }

  .article-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium);
  }

  .article-content-wrapper {
    display: block;
  }

  .article-image-container {
    position: relative;
    overflow: hidden;
    height: 180px;
  }

  .article-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(30%);
    transition: filter 0.3s ease;
  }

  .article-card:hover .article-image {
    filter: grayscale(0%);
  }

  .article-overlay {
    position: absolute;
    top: 15px;
    left: 15px;
  }

  .article-category {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .article-text-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .article-title {
    margin: 0 0 10px;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .article-title a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .article-title a:hover {
    color: var(--accent-color);
  }

  .article-excerpt {
    color: var(--text-secondary);
    margin: 0 0 15px;
    font-size: 0.9rem;
    line-height: 1.4;
    flex: 1;
  }

  .article-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-light);
    padding-top: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: auto;
    flex-wrap: wrap;
    gap: 10px;
  }

  .article-date {
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .read-more {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 700;
    transition: color 0.3s ease;
  }

  .read-more:hover {
    color: var(--accent-hover);
  }

  /* Sidebar - Mobile optimized with proper order */
  .sidebar {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    height: fit-content;
    /* Mobile: show sidebar after main content */
    order: 1;
  }

  /* Reorder sidebar sections for mobile */
  .sidebar-section.tips-section {
    order: 1;
  }

  .sidebar-section.info-section {
    order: 2;
  }

  .sidebar-section:not(.tips-section):not(.info-section) {
    /* Latest reports section - comes last on mobile */
    order: 3;
  }

  .sidebar-section {
    padding: 25px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-section:last-child {
    border-bottom: none;
  }

  .sidebar-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
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

  /* Info Section */
  .info-section {
    background: var(--bg-tertiary);
  }

  .info-content p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
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
    margin: 0;
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

  .no-sidebar-content {
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    margin: 0;
    padding: 20px 0;
  }

  /* Error and Empty States */
  .error-message {
    background: var(--error-bg);
    color: var(--error-text);
    padding: 30px 20px;
    border-left: 4px solid var(--error-border);
    text-align: center;
    margin: 20px 0;
  }

  .error-message h3 {
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .retry-btn {
    background: var(--error-text);
    color: white;
    border: none;
    padding: 12px 20px;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    margin-top: 15px;
  }

  .empty-state {
    background: var(--bg-secondary);
    padding: 40px 20px;
    border: 1px solid var(--border-color);
    text-align: center;
  }

  .empty-state h3 {
    margin: 0 0 12px;
    color: var(--text-primary);
    font-weight: 700;
    text-transform: uppercase;
  }

  .empty-state p {
    color: var(--text-muted);
    margin: 0 0 20px;
  }

  .clear-search-btn {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 12px 20px;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
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

  /* Tablet Responsive Design */
  @media (min-width: 768px) {
    .main-content {
      padding: 0 30px;
    }

    .content-grid {
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }

    .sidebar {
      /* Reset order for desktop */
      order: 0;
    }

    /* Reset section order for desktop */
    .sidebar-section.tips-section,
    .sidebar-section.info-section,
    .sidebar-section:not(.tips-section):not(.info-section) {
      order: initial;
    }

    .category-controls {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 25px 30px;
    }

    .search-container {
      max-width: 400px;
    }

    .featured-content-wrapper {
      grid-template-columns: 1fr 1.2fr;
      min-height: 300px;
    }

    .featured-image-container {
      height: auto;
      order: 0;
    }

    .featured-text-content {
      padding: 30px;
      order: 0;
    }

    .article-content-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 180px;
    }

    .article-image-container {
      height: auto;
    }

    .article-overlay {
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7));
      display: flex;
      align-items: flex-end;
      padding: 10px;
    }

    .article-category {
      background: rgba(255, 255, 255, 0.9);
      color: var(--text-primary);
    }

    .articles-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }

    .tips-button {
      width: auto;
      text-align: left;
    }

    .footer-content {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }
  }

  /* Desktop Responsive Design */
  @media (min-width: 1024px) {
    .category-title {
      font-size: 2.8rem;
      letter-spacing: 2px;
    }

    .category-subtitle {
      font-size: 1.1rem;
    }

    .category-divider {
      width: 120px;
      height: 4px;
    }

    .featured-title {
      font-size: 1.6rem;
    }

    .section-title {
      font-size: 1.4rem;
      letter-spacing: 2px;
    }

    .section-divider {
      width: 80px;
    }

    .article-card:hover {
      transform: translateY(-2px);
    }

    .articles-grid {
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }
  }

  /* Mobile specific optimizations */
  @media (max-width: 480px) {
    .site-wrapper {
      padding-top: 70px;
    }

    .main-content {
      padding: 0 10px;
    }

    .category-hero {
      margin: 15px 0 25px;
    }

    .category-title {
      font-size: 1.6rem;
      letter-spacing: 1px;
    }

    .category-subtitle {
      font-size: 0.95rem;
      padding: 0 5px;
    }

    .category-controls {
      padding: 15px 12px;
      gap: 15px;
      /* Ensure no horizontal overflow */
      overflow: hidden;
    }

    .search-container {
      gap: 8px;
      /* Force proper mobile layout */
      width: 100%;
      max-width: 100%;
    }

    .search-input {
      padding: 10px 12px;
      font-size: 13px;
      /* Ensure input doesn't overflow */
      min-width: 0;
      flex: 1;
    }

    .search-btn {
      padding: 10px 14px;
      font-size: 10px;
      /* Ensure button stays visible */
      min-width: 70px;
    }

    .featured-text-content {
      padding: 15px 12px;
    }

    .featured-title {
      font-size: 1.2rem;
    }

    .article-text-content {
      padding: 15px;
    }

    .sidebar-section {
      padding: 20px 15px;
    }

    /* Maintain proper section order on mobile */
    .sidebar-section.tips-section {
      order: 1;
    }

    .sidebar-section.info-section {
      order: 2;
    }

    .sidebar-section:not(.tips-section):not(.info-section) {
      order: 3;
    }

    .section-title {
      font-size: 1.1rem;
    }

    .error-message,
    .empty-state {
      padding: 25px 15px;
    }
  }

  /* Extra small screens */
  @media (max-width: 320px) {
    .category-title {
      font-size: 1.4rem;
    }

    .featured-title {
      font-size: 1.1rem;
    }

    .article-title {
      font-size: 1rem;
    }

    .sidebar-section {
      padding: 15px 12px;
    }
  }

  /* Focus states for accessibility */
  .search-input:focus,
  .search-btn:focus,
  .featured-cta:focus,
  .read-more:focus,
  .tips-button:focus {
    outline: 3px solid rgba(215, 48, 39, 0.5);
    outline-offset: 2px;
  }

  /* Improve touch targets on mobile */
  @media (max-width: 768px) {
    .article-title a,
    .sidebar-news-title a {
      display: block;
      padding: 5px 0;
    }

    .read-more {
      padding: 5px 0;
    }
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Selection styling */
  ::selection {
    background: var(--accent-color);
    color: white;
  }
</style>