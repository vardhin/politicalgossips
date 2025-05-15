<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import NavBar from './../../lib/components/NavBar.svelte';
  
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
  
  // Use onMount to ensure proper initialization
  onMount(() => {
    console.log("URL Search params:", $page.url.searchParams.toString());
    
    if (articleId) {
      console.log(`Article ID from URL: ${articleId}, slug: ${slug}`);
      fetchArticle(articleId).then(data => {
        article = data;
      });
    } else {
      error = 'Article ID is missing';
      loading = false;
    }
  });
  
  // Watch for URL parameter changes
  $: if (articleId && !loading) {
    console.log(`URL parameter changed, fetching article: ${articleId}`);
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
  /* Base styles - matching your existing site style */
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
    padding: 2rem;
    text-align: center;
  }
  
  /* Article styles */
  .article-section {
    margin-top: 2rem;
  }
  
  .article-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .article-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .category {
    color: #2c3e50;
    font-weight: 600;
    padding: 0.3rem 0.8rem;
    background: rgba(44, 62, 80, 0.1);
    border-radius: 4px;
  }
  
  .date {
    color: #666;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }
  
  .article-image-container {
    margin-bottom: 2rem;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .article-image-container img {
    width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: cover;
  }
  
  .article-summary {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(44, 62, 80, 0.05);
    border-left: 4px solid #2c3e50;
    border-radius: 0 8px 8px 0;
  }
  
  .summary-text {
    font-size: 1.2rem;
    font-weight: 500;
    font-style: italic;
    color: #2c3e50;
    line-height: 1.6;
  }
  
  .article-body {
    line-height: 1.8;
    color: #333;
    margin-bottom: 2.5rem;
  }
  
  .article-body p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
  
  .article-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .btn-back, .btn-share {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-back {
    background-color: rgba(44, 62, 80, 0.85);
    color: white;
    text-decoration: none;
  }
  
  .btn-back:hover {
    background-color: rgba(44, 62, 80, 1);
  }
  
  .btn-share {
    background-color: rgba(76, 175, 80, 0.85);
    color: white;
    border: none;
  }
  
  .btn-share:hover {
    background-color: rgba(76, 175, 80, 1);
  }
  
  /* Loading state styles */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(44, 62, 80, 0.1);
    border-radius: 50%;
    border-top: 5px solid rgba(44, 62, 80, 0.8);
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error message styles */
  .error-message {
    padding: 2rem;
    text-align: center;
    color: #721c24;
  }
  
  .error-message h2 {
    color: #721c24;
    margin-bottom: 1rem;
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
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    
    .article-meta {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
    
    .article-actions {
      flex-direction: column;
      gap: 1rem;
    }
    
    .btn-back, .btn-share {
      width: 100%;
      text-align: center;
    }
  }
</style>