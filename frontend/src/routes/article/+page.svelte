<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from '../../lib/components/NavBar.svelte';
  import { theme } from '$lib/stores/theme';
  import '$lib/styles/theme.css';

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
  
  // Get article ID from URL query parameters
  $: articleId = $page.url.searchParams.get('id');
  
  // Using environment variable for API URL
  const API_URL = PUBLIC_API_URL;

  // Add reactive statement to update body class
  $: {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', $theme === 'dark');
    }
  }
  
  // Get absolute image URL for social media - MUST return full URL
  function getImageUrl(articleId) {
    if (!articleId) {
      // Return your actual default image from backend instead of placehold.co
      return `${API_URL}/image/1`; // Make sure article ID 1 exists in your database
    }
    return `${API_URL}/image/${articleId}`;
  }

  // Get absolute URL for sharing
  function getAbsoluteUrl() {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }
  
  // Improved image URL function for displaying in the page
  function getArticleImageUrl(articleId) {
    if (!articleId) return "";
    return `${API_URL}/image/${articleId}`;
  }
  
  // Fetch article data
  async function fetchArticle(id) {
    if (!id) {
      error = 'No article ID provided';
      loading = false;
      return;
    }

    try {
      loading = true;
      error = null;
      
      const response = await fetch(`${API_URL}/api/articles/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
      }
      
      article = await response.json();
      
      // Fetch related articles from the same category
      if (article.category) {
        await fetchRelatedArticles(article.category, id);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  // Fetch related articles
  async function fetchRelatedArticles(category, currentId) {
    try {
      const response = await fetch(`${API_URL}/api/articles/category/${category}?limit=3`);
      if (response.ok) {
        const articles = await response.json();
        // Filter out the current article
        relatedArticles = articles.filter(a => a.articleId !== parseInt(currentId));
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  }
  
  // Format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Reactive statement to fetch article when ID changes
  $: if (articleId) {
    fetchArticle(articleId);
  }
  
  onMount(() => {
    if (articleId) {
      fetchArticle(articleId);
    }
  });
</script>

<svelte:head>
  <title>{article ? article.title + ' - Political Gossips' : 'Article - Political Gossips'}</title>
  
  <!-- Standard Meta Tags -->
  <meta name="description" content={article ? article.summary : 'Independent investigative journalism exposing political corruption'} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  {#if article && article.articleId}
    <!-- Canonical URL -->
    <link rel="canonical" href={getAbsoluteUrl()} />
    
    <!-- Open Graph / Facebook / WhatsApp Meta Tags -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={getAbsoluteUrl()} />
    <meta property="og:title" content={article.title} />
    <meta property="og:description" content={article.summary} />
    <meta property="og:site_name" content="Political Gossips" />
    
    <!-- EXPLICIT og:image with actual article image -->
    <meta property="og:image" content={getImageUrl(article.articleId)} />
    <meta property="og:image:secure_url" content={getImageUrl(article.articleId)} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={article.title} />
    
    <!-- Additional article metadata -->
    <meta property="og:locale" content="en_US" />
    <meta property="article:published_time" content={article.date} />
    <meta property="article:modified_time" content={article.updatedAt || article.date} />
    <meta property="article:section" content={article.category} />
    <meta property="article:tag" content={article.category} />
    <meta property="article:author" content="Political Gossips" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@politicalgossips" />
    <meta name="twitter:creator" content="@politicalgossips" />
    <meta name="twitter:url" content={getAbsoluteUrl()} />
    <meta name="twitter:title" content={article.title} />
    <meta name="twitter:description" content={article.summary} />
    <meta name="twitter:image" content={getImageUrl(article.articleId)} />
    <meta name="twitter:image:alt" content={article.title} />
    
    <!-- Additional meta for better SEO -->
    <meta name="author" content="Political Gossips" />
    <meta name="publish_date" property="og:publish_date" content={article.date} />
  {/if}
</svelte:head>

<div class="page-wrapper">
  <NavBar links={navLinks} />
  
  <main class="article-page">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>
    {:else if error}
      <div class="error">
        <h2>Error Loading Article</h2>
        <p>{error}</p>
        <a href="/" class="btn-back">Back to Home</a>
      </div>
    {:else if article}
      <article class="article-content">
        <!-- Article Header -->
        <header class="article-header">
          <div class="article-meta">
            <span class="category {article.category?.toLowerCase()}">{article.category}</span>
            <time datetime={article.date}>{formatDate(article.date)}</time>
          </div>
          <h1 class="article-title">{article.title}</h1>
          <p class="article-summary">{article.summary}</p>
        </header>

        <!-- Article Image -->
        {#if article.articleId}
          <div class="article-image">
            <img 
              src={getArticleImageUrl(article.articleId)} 
              alt={article.title}
              loading="lazy"
            />
          </div>
        {/if}

        <!-- Article Body -->
        <div class="article-body">
          {@html article.article_text}
        </div>

        <!-- Social Share Buttons -->
        <div class="share-section">
          <h3>Share This Article</h3>
          <div class="share-buttons">
            <button 
              class="share-btn whatsapp"
              on:click={() => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + getAbsoluteUrl())}`, '_blank')}
            >
              <span>WhatsApp</span>
            </button>
            <button 
              class="share-btn facebook"
              on:click={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getAbsoluteUrl())}`, '_blank')}
            >
              <span>Facebook</span>
            </button>
            <button 
              class="share-btn twitter"
              on:click={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(getAbsoluteUrl())}`, '_blank')}
            >
              <span>Twitter</span>
            </button>
          </div>
        </div>
      </article>

      <!-- Related Articles -->
      {#if relatedArticles.length > 0}
        <section class="related-articles">
          <h2>Related Articles</h2>
          <div class="related-grid">
            {#each relatedArticles as related}
              <a href="/article?id={related.articleId}" class="related-card">
                {#if related.articleId}
                  <img 
                    src={getArticleImageUrl(related.articleId)} 
                    alt={related.title}
                    loading="lazy"
                  />
                {/if}
                <div class="related-content">
                  <span class="category {related.category?.toLowerCase()}">{related.category}</span>
                  <h3>{related.title}</h3>
                  <p>{related.summary}</p>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  </main>
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
    width: 100%;
    /* Mobile: adapt to image but with constraints */
    min-height: 200px;
    max-height: 500px;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .article-image {
    width: 100%;
    height: 100%;
    /* Cover ensures image fills container, zooming if needed */
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
    line-height: 1.9;
    margin-bottom: 30px;
  }

  .article-body p {
    margin-bottom: 18px;
    font-size: 1rem;
    line-height: 2;
  }

  .article-body br {
    display: block;
    content: "";
    margin-top: 0.5em;
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
    cursor: pointer;
  }

  .related-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium);
    transform: translateY(-2px);
  }

  .related-image-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    /* Mobile: adapt to image but with constraints */
    min-height: 150px;
    max-height: 400px;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .related-image {
    width: 100%;
    height: 100%;
    /* Cover ensures image fills container, zooming if needed */
    object-fit: cover;
    object-position: center;
    filter: grayscale(30%);
    transition: filter 0.3s ease;
    display: block;
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

    .article-image-container {
      /* Desktop: flexible height to accommodate tall images */
      min-height: 300px;
      max-height: 700px;
      height: auto;
    }

    .article-image {
      /* Cover zooms short images, but container can grow for tall images */
      object-fit: cover;
      min-height: 300px;
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

    /* Main article images can be even taller on large screens */
    .article-image-container {
      min-height: 400px;
      max-height: 800px;
    }

    .article-image {
      min-height: 400px;
    }

    /* Related cards slightly taller */
    .related-image-container {
      height: 280px;
      min-height: 280px;
      max-height: 280px;
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

    .article-image-container {
      min-height: 180px;
      max-height: 450px;
    }

    .related-image-container {
      min-height: 140px;
      max-height: 350px;
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

    .article-image-container {
      min-height: 150px;
      max-height: 400px;
    }

    .related-image-container {
      min-height: 120px;
      max-height: 300px;
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

  /* Add styles for related card links */
  .related-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
  }

  .related-card-link:focus {
    outline: 3px solid rgba(215, 48, 39, 0.5);
    outline-offset: 2px;
  }
</style>