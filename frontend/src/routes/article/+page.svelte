<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from '../../lib/components/NavBar.svelte';
  import { theme } from '$lib/stores/theme';
  import '$lib/styles/theme.css';

  // Get server-side loaded data
  export let data;

  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "HOME", active: false },
    { href: "/category/general", label: "GENERAL", active: false },
    { href: "/category/political", label: "POLITICAL", active: false },
    { href: "/category/crime", label: "CRIME", active: false },
    { href: "/contact", label: "CONTACT US", active: false },
  ];
  
  // States - initialize with server data
  let article = data.article;
  let relatedArticles = [];
  let loading = false;
  let error = data.error;
  
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
  
  // Get absolute image URL for social media
  function getImageUrl(articleId) {
    if (!articleId) {
      return `${API_URL}/image/1`;
    }
    return `${API_URL}/image/${articleId}`;
  }

  // Get absolute URL for sharing
  function getAbsoluteUrl() {
    if (typeof window === 'undefined') {
      return `https://www.politicalgossips.com/article?id=${articleId}`;
    }
    return window.location.href;
  }
  
  // Get article image URL
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
  <meta name="description" content={article ? article.summary : 'Independent investigative journalism exposing political corruption'} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href={getAbsoluteUrl()} />
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content={getAbsoluteUrl()} />
  <meta property="og:title" content={article ? article.title : 'Political Gossips'} />
  <meta property="og:description" content={article ? article.summary : 'Independent investigative journalism'} />
  <meta property="og:site_name" content="Political Gossips" />
  <meta property="og:image" content={article && article.articleId ? getImageUrl(article.articleId) : getImageUrl(1)} />
  <meta property="og:image:secure_url" content={article && article.articleId ? getImageUrl(article.articleId) : getImageUrl(1)} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  {#if article}
    <meta property="article:published_time" content={article.date} />
    <meta property="article:section" content={article.category} />
  {/if}
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={article ? article.title : 'Political Gossips'} />
  <meta name="twitter:description" content={article ? article.summary : 'Independent investigative journalism'} />
  <meta name="twitter:image" content={article && article.articleId ? getImageUrl(article.articleId) : getImageUrl(1)} />
</svelte:head>

<div class="page-wrapper" class:dark={$theme === 'dark'}>
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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #fafafa;
    color: #1a1a1a;
  }

  :global(body.dark) {
    background-color: #0f0f0f;
    color: #e5e5e5;
  }

  .page-wrapper {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --text-tertiary: #666666;
    --border-color: #d0d0d0;
    --accent-color: #d73027;
    --accent-hover: #b71c1c;
    
    min-height: 100vh;
    padding-top: 80px;
  }

  .page-wrapper.dark {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --text-primary: #e5e5e5;
    --text-secondary: #b8b8b8;
    --text-tertiary: #888888;
    --border-color: #333333;
    --accent-color: #ef5350;
    --accent-hover: #d32f2f;
  }

  .article-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .article-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    margin-bottom: 40px;
  }

  .article-header {
    padding: 40px;
    border-bottom: 1px solid var(--border-color);
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .category {
    background: var(--accent-color);
    color: white;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  time {
    color: var(--text-tertiary);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .article-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 20px;
    line-height: 1.2;
  }

  .article-summary {
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-style: italic;
    margin: 0;
    line-height: 1.6;
  }

  .article-image {
    width: 100%;
    overflow: hidden;
  }

  .article-image img {
    width: 100%;
    height: auto;
    display: block;
  }

  .article-body {
    padding: 40px;
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 1.1rem;
  }

  .article-body :global(p) {
    margin-bottom: 20px;
  }

  .share-section {
    padding: 30px 40px;
    border-top: 1px solid var(--border-color);
  }

  .share-section h3 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 20px;
    color: var(--text-primary);
  }

  .share-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .share-btn {
    padding: 12px 24px;
    border: none;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .share-btn.whatsapp {
    background: #25D366;
    color: white;
  }

  .share-btn.whatsapp:hover {
    background: #128C7E;
  }

  .share-btn.facebook {
    background: #1877F2;
    color: white;
  }

  .share-btn.facebook:hover {
    background: #145DBF;
  }

  .share-btn.twitter {
    background: #1DA1F2;
    color: white;
  }

  .share-btn.twitter:hover {
    background: #0C85D0;
  }

  .related-articles {
    margin-top: 60px;
  }

  .related-articles h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 30px;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  .related-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .related-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .related-content {
    padding: 20px;
  }

  .related-content .category {
    display: inline-block;
    margin-bottom: 12px;
  }

  .related-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 10px;
    color: var(--text-primary);
  }

  .related-content p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
  }

  .loading {
    text-align: center;
    padding: 60px 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 60px 20px;
  }

  .error h2 {
    color: var(--accent-color);
    margin-bottom: 20px;
  }

  .btn-back {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background: var(--accent-color);
    color: white;
    text-decoration: none;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-back:hover {
    background: var(--accent-hover);
  }

  @media (max-width: 768px) {
    .article-page {
      padding: 20px 15px;
    }

    .article-header,
    .article-body,
    .share-section {
      padding: 20px;
    }

    .article-title {
      font-size: 1.8rem;
    }

    .article-summary {
      font-size: 1rem;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }
</style>