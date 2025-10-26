<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from '../../lib/components/NavBar.svelte';
  import { theme } from '$lib/stores/theme';
  import '$lib/styles/theme.css';
  import { Share2, Facebook } from 'lucide-svelte';

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
  let similarArticles = [];
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
      const response = await fetch(`${API_URL}/api/articles/category/${category}?limit=6`);
      if (response.ok) {
        const articles = await response.json();
        const filtered = articles.filter(a => a.articleId !== parseInt(currentId));
        relatedArticles = filtered.slice(0, 3);
        similarArticles = filtered.slice(3, 6);
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
  <NavBar brand="POLITICAL GOSSIPS" links={navLinks}/>
  
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
              class="share-btn share-link"
              on:click={() => {
                navigator.clipboard.writeText(getAbsoluteUrl());
                alert('Link copied to clipboard!');
              }}
            >
              <Share2 size={18} />
              <span>Share Link</span>
            </button>
            <button 
              class="share-btn whatsapp"
              on:click={() => window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + getAbsoluteUrl())}`, '_blank')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="whatsapp-icon" viewBox="0 0 16 16" width="18" height="18">
                <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z"/>
                <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
            <button 
              class="share-btn twitter"
              on:click={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(getAbsoluteUrl())}`, '_blank')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="twitter-x-icon" viewBox="0 0 16 16" width="18" height="18">
                <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" stroke-width="1"></path>
              </svg>
              <span>X</span>
            </button>
            <button 
              class="share-btn facebook"
              on:click={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getAbsoluteUrl())}`, '_blank')}
            >
              <Facebook size={18} />
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </article>

      <!-- Similar Articles Section -->
      {#if similarArticles.length > 0}
        <section class="similar-articles">
          <div class="section-header">
            <h2 class="section-title">SIMILAR ARTICLES</h2>
            <div class="section-divider"></div>
          </div>
          <div class="similar-grid">
            {#each similarArticles as similar}
              <a href="/article?id={similar.articleId}" class="similar-card">
                {#if similar.articleId}
                  <div class="similar-image">
                    <img 
                      src={getArticleImageUrl(similar.articleId)} 
                      alt={similar.title}
                      loading="lazy"
                    />
                  </div>
                {/if}
                <div class="similar-content">
                  <span class="category {similar.category?.toLowerCase()}">{similar.category}</span>
                  <h3>{similar.title}</h3>
                  <p>{similar.summary}</p>
                  <time datetime={similar.date}>{formatDate(similar.date)}</time>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}

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
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
  }

  .share-btn :global(svg) {
    flex-shrink: 0;
  }

  .whatsapp-icon,
  .twitter-x-icon {
    flex-shrink: 0;
  }

  .share-btn.share-link {
    background: #6c757d;
    color: white;
  }

  .share-btn.share-link:hover {
    background: #5a6268;
  }

  .share-btn.whatsapp {
    background: #25D366;
    color: white;
  }

  .share-btn.whatsapp:hover {
    background: #20BA5A;
  }

  .share-btn.twitter {
    background: #000000;
    color: white;
  }

  .share-btn.twitter:hover {
    background: #333333;
  }

  .page-wrapper.dark .share-btn.twitter {
    background: #ffffff;
    color: #000000;
  }

  .page-wrapper.dark .share-btn.twitter:hover {
    background: #e0e0e0;
  }

  .share-btn.facebook {
    background: #1877F2;
    color: white;
  }

  .share-btn.facebook:hover {
    background: #165DC6;
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
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
  }

  .share-btn :global(svg) {
    flex-shrink: 0;
  }

  .whatsapp-icon,
  .twitter-x-icon {
    flex-shrink: 0;
  }

  .share-btn.share-link {
    background: #6c757d;
    color: white;
  }

  .share-btn.share-link:hover {
    background: #5a6268;
  }

  .share-btn.whatsapp {
    background: #25D366;
    color: white;
  }

  .share-btn.whatsapp:hover {
    background: #20BA5A;
  }

  .share-btn.twitter {
    background: #000000;
    color: white;
  }

  .share-btn.twitter:hover {
    background: #333333;
  }

  .page-wrapper.dark .share-btn.twitter {
    background: #ffffff;
    color: #000000;
  }

  .page-wrapper.dark .share-btn.twitter:hover {
    background: #e0e0e0;
  }

  .share-btn.facebook {
    background: #1877F2;
    color: white;
  }

  .share-btn.facebook:hover {
    background: #165DC6;
  }

  /* Similar Articles Section */
  .similar-articles {
    margin: 40px 0;
  }

  .section-header {
    margin-bottom: 30px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 15px;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .section-divider {
    width: 80px;
    height: 3px;
    background: var(--accent-color);
    margin-top: 10px;
  }

  .similar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  .similar-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .similar-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px var(--shadow-medium);
  }

  .similar-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: var(--bg-secondary);
  }

  .similar-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .similar-card:hover .similar-image img {
    transform: scale(1.05);
  }

  .similar-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .similar-content .category {
    display: inline-block;
    margin-bottom: 12px;
  }

  .similar-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 10px;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .similar-content p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 15px;
    flex: 1;
  }

  .similar-content time {
    color: var(--text-tertiary);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    .article-page {
      padding: 20px 15px;
    }

    .article-header,
    .article_body,
    .share-section {
      padding: 20px;
    }

    .article-title {
      font-size: 1.8rem;
    }

    .article-summary {
      font-size: 1rem;
    }

    .share-btn {
      padding: 10px 18px;
      font-size: 13px;
      flex: 1 1 calc(50% - 7.5px);
      min-width: 140px;
    }

    .share-btn :global(svg),
    .whatsapp-icon,
    .twitter-x-icon {
      width: 16px;
      height: 16px;
    }

    .section-title {
      font-size: 1.4rem;
    }

    .similar-grid {
      grid-template-columns: 1fr;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .share-btn {
      flex: 1 1 100%;
    }
  }
</style>