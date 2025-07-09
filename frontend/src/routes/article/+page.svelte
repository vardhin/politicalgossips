<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from './../../lib/components/NavBar.svelte';
  import { theme } from './../../lib/stores/theme';
  import './../../lib/styles/theme.css';
  
  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "HOME", active: false },
    { href: "/category/general", label: "GENERAL", active: false },
    { href: "/category/political", label: "POLITICAL", active: false },
    { href: "/category/crime", label: "CRIME", active: false },
    { href: "/contact", label: "CONTACT US", active: false },
  ];
  
  // States
  let article = null;
  let relatedArticles = [];
  let loading = true;
  let error = null;
  
  // Get article ID from URL query parameters instead of path params
  $: articleId = $page.url.searchParams.get('id');
  $: slug = $page.url.searchParams.get('slug');
  
  // Using environment variable for API URL
  const API_URL = PUBLIC_API_URL;

  // Add reactive statement to update body class
  $: {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', $theme === 'dark');
    }
  }

  // Function to slugify titles for URLs
  function slugify(text) {
    if (!text) return '';
    
    return text
      .normalize('NFD')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
  
  // Improved image URL function
  function getImageUrl(id) {
    if (!id) return "https://placehold.co/800x400/2c2c2c/ffffff?text=NEWS";
    return `${API_URL}/image/${id}`;
  }
  
  // Function to format date
  function formatDate(dateString) {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Function to truncate text to 2 lines
  function truncateToTwoLines(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }
  
  // Enhanced fetch article data function
  async function fetchArticle(id) {
    try {
      loading = true;
      error = null;
      
      if (!id) {
        throw new Error('Invalid article ID');
      }
      
      console.log(`Fetching article with ID: ${id}`);
      const response = await fetch(`${API_URL}/articles/${id}`);
      
      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new Error('Article not found');
        } else {
          throw new Error(`Failed to fetch article: ${response.statusText || status}`);
        }
      }
      
      const data = await response.json();
      console.log('Received article data:', data);
      return data;
    } catch (err) {
      console.error('Error fetching article:', err);
      error = err.message || 'Failed to load article';
      return null;
    } finally {
      loading = false;
    }
  }

  // Function to fetch related articles
  async function fetchRelatedArticles(category) {
    try {
      // First try to fetch by category
      let response = await fetch(`${API_URL}/articles/category/${category.toLowerCase()}?limit=4`);
      
      if (!response.ok || response.status === 404) {
        // If category-specific fetch fails, get featured articles
        console.log('Category fetch failed, falling back to featured articles');
        response = await fetch(`${API_URL}/articles/featured?limit=4`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch related articles');
      }
      
      const data = await response.json();
      
      // Format articles to match expected structure
      return data.map(article => ({
        id: article.articleId,
        title: article.title,
        category: article.category,
        summary: truncateToTwoLines(article.summary),
        image: getImageUrl(article.articleId),
        date: new Date(article.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
    } catch (err) {
      console.error('Error fetching related articles:', err);
      return [];
    }
  }
  
  // Add a tracking variable
  let currentlyLoadedId = null;

  // Use onMount to ensure proper initialization
  onMount(() => {
    console.log("URL Search params:", $page.url.searchParams.toString());
    
    // Set initial body class
    document.body.classList.toggle('dark', $theme === 'dark');
    
    if (articleId) {
      console.log(`Article ID from URL: ${articleId}, slug: ${slug}`);
      currentlyLoadedId = articleId;
      fetchArticle(articleId).then(async data => {
        article = data;
        if (data && data.category) {
          // Fetch related articles based on category
          relatedArticles = await fetchRelatedArticles(data.category);
          // Filter out current article from related articles
          relatedArticles = relatedArticles.filter(related => related.id !== data.articleId);
        }
      });
    } else {
      error = 'Article ID is missing';
      loading = false;
    }
  });
  
  // Watch for URL parameter changes
  $: if (articleId && !loading && articleId !== currentlyLoadedId) {
    console.log(`URL parameter changed, fetching article: ${articleId}`);
    currentlyLoadedId = articleId;
    fetchArticle(articleId).then(async data => {
      article = data;
      if (data && data.category) {
        relatedArticles = await fetchRelatedArticles(data.category);
        relatedArticles = relatedArticles.filter(related => related.id !== data.articleId);
      }
    });
  }
</script>

<svelte:head>
  <title>{article ? article.title + ' - Political Gossips' : 'Article - Political Gossips'}</title>
  <meta name="description" content={article ? article.summary : 'Independent investigative journalism exposing political corruption'} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="site-wrapper" class:dark={$theme === 'dark'}>
  <!-- Integrated NavBar component -->
  <NavBar brand="POLITICAL GOSSIPS" links={navLinks} sticky={true} />
  
  <main class="main-content">
    {#if error}
      <section class="error-section">
        <div class="error-container">
          <h2>NEWS NOT FOUND</h2>
          <p>{error}</p>
          <a href="/" class="error-btn">RETURN TO HOMEPAGE</a>
        </div>
      </section>
    {:else if loading}
      <section class="loading-section">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading News...</p>
        </div>
      </section>
    {:else if !article}
      <section class="error-section">
        <div class="error-container">
          <h2>ARTICLE NOT FOUND</h2>
          <p>The News you're looking for has been moved or removed.</p>
          <a href="/" class="error-btn">RETURN TO HOMEPAGE</a>
        </div>
      </section>
    {:else}
      <!-- Article Content Section -->
      <article class="article-main">
        <div class="article-header">
          <div class="article-meta">
            <span class="article-category">{article.category.toUpperCase()}</span>
            <time class="article-date">{formatDate(article.date)}</time>
          </div>
          
          <h1 class="article-title">{article.title}</h1>
          
          <div class="article-lead">
            <p class="summary-text">{article.summary}</p>
          </div>
        </div>
        
        <div class="article-image-container">
          <img 
            src={getImageUrl(article.articleId)} 
            alt={article.title}
            class="article-image"
            crossorigin="anonymous"
            on:error={(e) => e.target.src = "https://placehold.co/800x400/2c2c2c/ffffff?text=NEWS"}
          />
        </div>
        
        <div class="article-content">
          <div class="article-body">
            {#each article.article_text.split('\n\n') as paragraph}
              <p>{paragraph}</p>
            {/each}
          </div>
          
          <div class="article-footer">
            <div class="article-actions">
              <a href="/" class="action-btn primary">RETURN TO HOMEPAGE</a>
              <button class="action-btn secondary" on:click={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    text: article.summary,
                    url: window.location.href
                  }).catch(err => console.error('Error sharing:', err));
                } else {
                  const tempInput = document.createElement('input');
                  document.body.appendChild(tempInput);
                  tempInput.value = window.location.href;
                  tempInput.select();
                  document.execCommand('copy');
                  document.body.removeChild(tempInput);
                  alert('Link copied to clipboard!');
                }
              }}>
                SHARE NEWS
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- Related Articles Section -->
      {#if relatedArticles.length > 0}
        <section class="related-section">
          <div class="section-header">
            <h2 class="section-title">RELATED {article.category.toUpperCase()} NEWS</h2>
            <div class="section-divider"></div>
          </div>
          
          <div class="related-grid">
            {#each relatedArticles as relatedArticle}
              <article class="related-card">
                <div class="related-image-container">
                  <img 
                    src={relatedArticle.image} 
                    alt={relatedArticle.title}
                    class="related-image"
                    on:error={(e) => e.target.src = "https://placehold.co/400x250/2c2c2c/ffffff?text=REPORT"}
                  />
                  <div class="related-overlay">
                    <span class="related-category">{relatedArticle.category.toUpperCase()}</span>
                  </div>
                </div>
                
                <div class="related-content">
                  <h3 class="related-title">
                    <a href={`/article?id=${relatedArticle.id}&slug=${slugify(relatedArticle.title)}`}>
                      {relatedArticle.title}
                    </a>
                  </h3>
                  <p class="related-summary">{relatedArticle.summary}</p>
                  <div class="related-meta">
                    <time class="related-date">{relatedArticle.date}</time>
                    <span class="read-time">5 min read</span>
                  </div>
                </div>
              </article>
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  </main>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Political Gossips</h4>
        <p>Independent investigative journalism exposing political corruption and holding power accountable.</p>
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
  /* Import matching styles from main page */
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

  /* CSS Custom Properties - Matching main page */
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
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
    padding: 15px;
    box-sizing: border-box;
  }

  /* Article Main - Mobile optimized */
  .article-main {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 10px var(--shadow-light);
    margin-bottom: 30px;
    border-radius: 0;
    overflow: hidden;
  }

  .article-header {
    padding: 20px 15px;
    border-bottom: 1px solid var(--border-light);
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  .article-category {
    background: var(--accent-color);
    color: white;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .article-date {
    color: var(--text-tertiary);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .article-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 20px;
    line-height: 1.3;
    letter-spacing: -0.5px;
  }

  .article-lead {
    background: var(--bg-secondary);
    padding: 20px 15px;
    border-left: 4px solid var(--accent-color);
    margin: 0 -15px;
  }

  .summary-text {
    font-size: 1rem;
    font-weight: 500;
    font-style: italic;
    color: var(--text-primary);
    line-height: 1.6;
    margin: 0;
  }

  .article-image-container {
    position: relative;
    overflow: hidden;
  }

  .article-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    object-position: center;
    filter: grayscale(20%);
    display: block;
  }

  .article-content {
    padding: 20px 15px;
  }

  .article-body {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 30px;
  }

  .article-body p {
    margin-bottom: 18px;
    font-size: 1rem;
  }

  .article-footer {
    border-top: 2px solid var(--border-color);
    padding-top: 20px;
  }

  .article-actions {
    display: flex;
    gap: 15px;
    flex-direction: column;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 20px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    text-decoration: none;
    border: none;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  .action-btn.primary {
    background: var(--text-primary);
    color: var(--bg-primary);
  }

  .action-btn.primary:hover {
    background: var(--accent-color);
  }

  .action-btn.secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
  }

  .action-btn.secondary:hover {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
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

  /* Related Articles Section - Mobile first */
  .related-section {
    margin-bottom: 30px;
  }

  .related-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .related-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px var(--shadow-light);
  }

  .related-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium);
  }

  .related-image-container {
    position: relative;
    overflow: hidden;
    height: 180px;
  }

  .related-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: grayscale(30%);
    transition: filter 0.3s ease;
  }

  .related-card:hover .related-image {
    filter: grayscale(0%);
  }

  .related-overlay {
    position: absolute;
    top: 15px;
    left: 15px;
    right: auto;
    bottom: auto;
    background: none;
    display: flex;
    align-items: flex-start;
    padding: 0;
  }

  .related-category {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .related-content {
    padding: 20px;
  }

  .related-title {
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .related-title a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .related-title a:hover {
    color: var(--accent-color);
  }

  .related-summary {
    color: var(--text-secondary);
    margin: 0 0 15px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .related-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-light);
    padding-top: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .related-date {
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .read-time {
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Error and Loading States - Mobile optimized */
  .error-section,
  .loading-section {
    padding: 40px 15px;
    text-align: center;
  }

  .error-container {
    background: var(--error-bg);
    border: 1px solid var(--error-border);
    border-left: 4px solid var(--error-border);
    padding: 30px 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .error-container h2 {
    color: var(--error-text);
    margin: 0 0 15px;
    font-size: 1.3rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .error-container p {
    color: var(--error-text);
    margin: 0 0 25px;
    font-size: 1rem;
    line-height: 1.5;
  }

  .error-btn {
    background: var(--error-text);
    color: white;
    padding: 12px 20px;
    text-decoration: none;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    display: inline-block;
    width: 100%;
    max-width: 250px;
    text-align: center;
    box-sizing: border-box;
  }

  .error-btn:hover {
    background: var(--accent-color);
  }

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

    .article-header {
      padding: 40px 50px 30px;
    }

    .article-content {
      padding: 40px 50px;
    }

    .article-title {
      font-size: 2.2rem;
      margin-bottom: 25px;
    }

    .article-lead {
      padding: 25px;
      margin: 0 -25px;
    }

    .summary-text {
      font-size: 1.2rem;
    }

    .article-image {
      height: 400px;
    }

    .article-body p {
      font-size: 1.1rem;
      margin-bottom: 20px;
    }

    .article-actions {
      flex-direction: row;
      gap: 20px;
    }

    .action-btn {
      width: auto;
      min-width: 200px;
    }

    .related-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }

    .related-overlay {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7));
      display: flex;
      align-items: flex-end;
      padding: 15px;
    }

    .related-category {
      background: rgba(255, 255, 255, 0.9);
      color: var(--text-primary);
    }

    .footer-content {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .section-title {
      font-size: 1.4rem;
      letter-spacing: 2px;
    }

    .section-divider {
      width: 80px;
    }
  }

  /* Desktop Responsive Design */
  @media (min-width: 1024px) {
    .article-title {
      font-size: 2.5rem;
    }

    .article-header {
      padding: 50px 60px 40px;
    }

    .article-content {
      padding: 50px 60px;
    }

    .related-card:hover {
      transform: translateY(-2px);
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

    .article-header {
      padding: 15px 12px;
    }

    .article-content {
      padding: 15px 12px;
    }

    .article-title {
      font-size: 1.4rem;
      margin-bottom: 15px;
    }

    .article-lead {
      padding: 15px 12px;
      margin: 0 -12px;
    }

    .summary-text {
      font-size: 0.95rem;
    }

    .article-image {
      height: 200px;
    }

    .article-body p {
      font-size: 0.95rem;
      margin-bottom: 15px;
    }

    .article-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .article-category {
      font-size: 10px;
      padding: 5px 10px;
    }

    .article-date {
      font-size: 11px;
    }

    .section-title {
      font-size: 1.1rem;
    }

    .related-content {
      padding: 15px;
    }

    .error-container {
      padding: 25px 15px;
    }

    .error-container h2 {
      font-size: 1.2rem;
    }

    .error-container p {
      font-size: 0.9rem;
    }
  }

  /* Extra small screens */
  @media (max-width: 320px) {
    .article-title {
      font-size: 1.2rem;
    }

    .article-header {
      padding: 12px 10px;
    }

    .article-content {
      padding: 12px 10px;
    }

    .related-content {
      padding: 12px;
    }

    .action-btn {
      padding: 12px 16px;
      font-size: 11px;
    }
  }

  /* Focus states for accessibility */
  .action-btn:focus,
  .error-btn:focus {
    outline: 3px solid rgba(215, 48, 39, 0.5);
    outline-offset: 2px;
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

  /* Improve touch targets on mobile */
  @media (max-width: 768px) {
    .related-title a {
      display: block;
      padding: 5px 0;
    }
  }
</style>