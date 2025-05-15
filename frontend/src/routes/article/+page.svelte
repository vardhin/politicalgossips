<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from './../../lib/components/NavBar.svelte';
  import { theme } from './../../lib/stores/theme';
  import './../../lib/styles/theme.css';
  
  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "Home", active: false },
    { href: "/category/general", label: "General", active: false },
    { href: "/category/political", label: "Political", active: false },
    { href: "/contact", label: "Contact", active: false },
  ];
  
  // States
  let article = null;
  let loading = true;
  let error = null;
  
  // Get article ID from URL query parameters instead of path params
  $: articleId = $page.url.searchParams.get('id');
  $: slug = $page.url.searchParams.get('slug');
  
  // Using environment variable for API URL
  const API_URL = PUBLIC_API_URL;
  
  // Improved image URL function
  function getImageUrl(id) {
    if (!id) return "https://placehold.co/800x400/eee/aaa?text=No+Image";
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
  
  // Add a tracking variable
  let currentlyLoadedId = null;

  // Use onMount to ensure proper initialization
  onMount(() => {
    console.log("URL Search params:", $page.url.searchParams.toString());
    
    if (articleId) {
      console.log(`Article ID from URL: ${articleId}, slug: ${slug}`);
      currentlyLoadedId = articleId;
      fetchArticle(articleId).then(data => {
        article = data;
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
    fetchArticle(articleId).then(data => {
      article = data;
    });
  }
</script>

<svelte:head>
  <title>{article ? article.title + ' - Political Gossips' : 'Article - Political Gossips'}</title>
  <meta name="description" content={article ? article.summary : 'Political news and analysis'} />
</svelte:head>

<div class="container">
  <!-- Integrated NavBar component -->
  <NavBar brand="Political Gossips" links={navLinks} sticky={true} />
  
  <main>
    <!-- Article Content Section -->
    <section class="article-section glass-panel">
      {#if error}
        <div class="error-message glass-card">
          <h2>Error</h2>
          <p>{error}</p>
          <a href="/" class="btn-back">Back to Homepage</a>
        </div>
      {:else if loading}
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
      {:else if !article}
        <div class="error-message glass-card">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <a href="/" class="btn-back">Back to Homepage</a>
        </div>
      {:else}
        <article class="article-content">
          <div class="article-meta">
            <span class="category">{article.category}</span>
            <span class="date">{formatDate(article.date)}</span>
          </div>
          
          <h1>{article.title}</h1>
          
          <div class="article-image-container">
            <img 
              src={getImageUrl(article.articleId)} 
              alt={article.title}
              crossorigin="anonymous"
              on:error={(e) => e.target.src = "https://placehold.co/800x400/eee/aaa?text=No+Image"}
            />
          </div>
          
          <div class="article-summary">
            <p class="summary-text">{article.summary}</p>
          </div>
          
          <div class="article-body">
            {#each article.article_text.split('\n\n') as paragraph}
              <p>{paragraph}</p>
            {/each}
          </div>
          
          <div class="article-actions">
            <a href="/" class="btn-back">Back to Homepage</a>
            <div class="share-buttons">
              <button class="btn-share" on:click={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    text: article.summary,
                    url: window.location.href
                  }).catch(err => console.error('Error sharing:', err));
                } else {
                  // Fallback for browsers without share API
                  const tempInput = document.createElement('input');
                  document.body.appendChild(tempInput);
                  tempInput.value = window.location.href;
                  tempInput.select();
                  document.execCommand('copy');
                  document.body.removeChild(tempInput);
                  alert('Link copied to clipboard!');
                }
              }}>
                Share
              </button>
            </div>
          </div>
        </article>
      {/if}
    </section>

    <!-- Related Articles Section (Optional) -->
    <!-- This could be implemented in a future enhancement -->
  </main>

  <footer class="glass-panel">
    <div class="copyright">
      &copy; {new Date().getFullYear()} Political Gossips. All rights reserved.
    </div>
  </footer>
</div>

<style>
  /* Base styles - improved responsiveness */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(60px, 10vw, 80px) clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px);
  }
  
  /* Enhanced glassmorphic styles */
  .glass-panel {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    padding: clamp(1.25rem, 5vw, 2.5rem);
    margin-bottom: clamp(2rem, 5vw, 3rem);
    transition: all 0.3s ease;
  }
  
  .glass-card {
    background: var(--glass-card-bg);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    padding: clamp(1.5rem, 5vw, 2.5rem);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--card-hover-shadow);
  }
  
  /* Improved article styles */
  .article-section {
    margin-top: clamp(1.5rem, 4vw, 2.5rem);
  }
  
  .article-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    margin-bottom: clamp(1.2rem, 4vw, 2rem);
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  
  .category {
    color: var(--text-primary);
    font-weight: 600;
    padding: 0.4rem 1rem;
    background: var(--category-bg);
    border-radius: 50px;
    transition: background 0.3s ease;
  }
  
  .date {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  h1 {
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: clamp(1.2rem, 4vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  
  .article-image-container {
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .article-image-container:hover {
    transform: scale(1.01);
    box-shadow: var(--card-hover-shadow);
  }
  
  .article-image-container img {
    width: 100%;
    height: auto;
    max-height: 550px;
    object-fit: cover;
    display: block;
    transition: transform 0.7s ease;
  }
  
  .article-image-container:hover img {
    transform: scale(1.03);
  }
  
  .article-summary {
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
    padding: clamp(1.2rem, 3vw, 1.8rem);
    background: var(--article-summary-bg);
    border-left: 5px solid var(--article-summary-border);
    border-radius: 0 12px 12px 0;
    transition: background 0.3s ease;
  }
  
  .summary-text {
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-weight: 500;
    font-style: italic;
    color: var(--text-primary);
    line-height: 1.7;
  }
  
  .article-body {
    line-height: 1.9;
    color: var(--text-secondary);
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  
  .article-body p {
    margin-bottom: clamp(1.2rem, 3vw, 1.8rem);
    font-size: clamp(1rem, 2.5vw, 1.15rem);
  }
  
  .article-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: clamp(1.5rem, 4vw, 2rem);
    border-top: 1px solid var(--glass-border);
    gap: 1rem;
  }
  
  .btn-back, .btn-share {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: clamp(0.7rem, 2vw, 0.9rem) clamp(1.2rem, 3vw, 1.6rem);
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    box-shadow: var(--card-shadow);
  }
  
  .btn-back {
    background-color: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    text-decoration: none;
  }
  
  .btn-back:hover, .btn-back:focus {
    background-color: var(--text-primary);
    transform: translateY(-2px);
    box-shadow: var(--card-hover-shadow);
  }
  
  .btn-share {
    background-color: var(--accent-color);
    color: white;
    border: none;
  }
  
  .btn-share:hover, .btn-share:focus {
    background-color: #3d8b40;
    transform: translateY(-2px);
    box-shadow: var(--card-hover-shadow);
  }
  
  /* Focus states for accessibility */
  .btn-back:focus, .btn-share:focus {
    outline: 3px solid rgba(76, 175, 80, 0.5);
    outline-offset: 2px;
  }
  
  /* Rest of your styles updated with CSS variables */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(3rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem);
    text-align: center;
  }
  
  .loading-spinner {
    width: clamp(40px, 10vw, 60px);
    height: clamp(40px, 10vw, 60px);
    border: 5px solid var(--glass-border);
    border-radius: 50%;
    border-top: 5px solid var(--text-primary);
    animation: spin 1s linear infinite;
    margin-bottom: clamp(1.2rem, 4vw, 2rem);
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Enhanced error message styles */
  .error-message {
    padding: clamp(1.5rem, 5vw, 2.5rem);
    text-align: center;
    color: var(--error-text);
    border-radius: 12px;
    background: var(--error-bg);
    border: 1px solid rgba(220, 53, 69, 0.3);
  }
  
  .error-message h2 {
    color: var(--error-text);
    margin-bottom: 1.2rem;
    font-size: clamp(1.4rem, 4vw, 1.7rem);
  }
  
  /* Improved footer */
  footer {
    text-align: center;
    padding: clamp(1.5rem, 3vw, 2rem);
  }
  
  .copyright {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  /* Enhanced responsive adjustments */
  @media (max-width: 768px) {
    .article-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
    }
    
    .article-actions {
      flex-direction: column;
      gap: 1rem;
    }
    
    .btn-back, .btn-share {
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .glass-panel {
      border-radius: 12px;
    }
    
    .btn-back, .btn-share {
      min-width: auto;
    }
  }
  
  /* Smooth scrolling and selection styling */
  html {
    scroll-behavior: smooth;
  }
  
  ::selection {
    background: var(--category-bg);
    color: var(--text-primary);
  }
</style>