<script>
  export let article;
  export let featured = false;
  export let slugify;
</script>

<article class="article-card" class:featured={featured}>
  <div class="article-content-wrapper">
    <div class="article-image-container">
      <img 
        src={article.image} 
        alt={article.title}
        class="article-image"
        on:error={(e) => e.target.src = featured 
          ? "https://placehold.co/600x400/2c2c2c/ffffff?text=NEWS"
          : "https://placehold.co/400x250/2c2c2c/ffffff?text=REPORT"}
      />
      <div class="article-overlay">
        {#if featured}
          <span class="article-badge">EXCLUSIVE</span>
        {:else}
          <span class="article-category">{article.category}</span>
        {/if}
      </div>
    </div>
    <div class="article-text-content">
      {#if !featured}
        <span class="article-category-text">{article.category}</span>
      {/if}
      <h3 class="article-title">
        <a href={`/article?id=${article.id}&slug=${slugify(article.title)}`}>
          {article.title}
        </a>
      </h3>
      <p class="article-excerpt">{article.excerpt}</p>
      <div class="article-meta">
        <time class="article-date">{article.date}</time>
        <span class="read-time">{article.readTime} min read</span>
        <a 
          href={`/article?id=${article.id}&slug=${slugify(article.title)}`} 
          class="article-cta"
        >
          READ MORE
        </a>
      </div>
    </div>
  </div>
</article>

<style>
  .article-card {
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #d0d0d0);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px var(--shadow-light, rgba(0, 0, 0, 0.05));
  }

  .article-card:hover {
    box-shadow: 0 4px 15px var(--shadow-medium, rgba(0, 0, 0, 0.1));
  }

  .article-card.featured {
    margin-bottom: 30px;
    box-shadow: 0 2px 10px var(--shadow-light, rgba(0, 0, 0, 0.05));
  }

  .article-content-wrapper {
    display: block;
  }

  .article-card.featured .article-content-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .article-image-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    /* Mobile: adapt to image but with constraints */
    min-height: 150px;
    max-height: 400px;
    background: var(--bg-secondary, #f8f8f8);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .article-card.featured .article-image-container {
    order: 1;
    min-height: 200px;
    max-height: 500px;
  }

  .article-image {
    width: 100%;
    height: 100%;
    /* Cover ensures image fills container, zooming if needed */
    object-fit: cover;
    object-position: center;
    filter: grayscale(30%);
    transition: filter 0.3s ease;
    display: block;
  }

  .article-card.featured .article-image {
    filter: grayscale(20%);
  }

  .article-card:hover .article-image {
    filter: grayscale(0%);
  }

  .article-overlay {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 1;
  }

  .article-badge {
    background: var(--accent-color, #d73027);
    color: white;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
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

  .article-card.featured .article-text-content {
    padding: 20px 15px;
    order: 2;
  }

  .article-category-text {
    color: var(--text-secondary, #4a4a4a);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .article-title {
    margin: 0 0 10px;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .article-card.featured .article-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 12px;
    line-height: 1.2;
  }

  .article-title a {
    color: var(--text-primary, #1a1a1a);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .article-title a:hover {
    color: var(--accent-color, #d73027);
  }

  .article-excerpt {
    color: var(--text-secondary, #4a4a4a);
    margin: 0 0 15px;
    font-size: 0.9rem;
    line-height: 1.4;
    flex: 1;
  }

  .article-card.featured .article-excerpt {
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 15px;
  }

  .article-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-light, #e8e8e8);
    padding-top: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: auto;
    flex-wrap: wrap;
    gap: 10px;
  }

  .article-card.featured .article-meta {
    border-top: none;
    padding-top: 0;
    gap: 15px;
  }

  .article-date {
    color: var(--text-tertiary, #666666);
    font-weight: 500;
  }

  .article-card.featured .article-date {
    font-size: 12px;
  }

  .read-time {
    color: var(--text-muted, #888888);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .article-cta {
    color: var(--accent-color, #d73027);
    text-decoration: none;
    font-weight: 700;
    transition: color 0.3s ease;
  }

  .article-card.featured .article-cta {
    background: var(--text-primary, #1a1a1a);
    color: var(--bg-primary, #ffffff);
    padding: 8px 16px;
    font-size: 10px;
    letter-spacing: 1px;
    margin-left: auto;
    white-space: nowrap;
  }

  .article-card.featured .article-cta:hover {
    background: var(--accent-color, #d73027);
  }

  .article-cta:hover {
    color: var(--accent-hover, #b71c1c);
  }

  /* Tablet and Desktop */
  @media (min-width: 768px) {
    .article-card.featured .article-content-wrapper {
      grid-template-columns: 1fr 1.2fr;
      min-height: 300px;
    }

    .article-card.featured .article-image-container {
      /* Featured images - flexible height to accommodate tall images */
      min-height: 300px;
      max-height: 600px;
      height: auto;
      order: 0;
    }

    .article-card.featured .article-image {
      /* Cover zooms short images, but container can grow for tall images */
      object-fit: cover;
      min-height: 300px;
    }

    .article-card.featured .article-text-content {
      padding: 30px;
      order: 0;
    }

    .article-content-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 200px;
    }

    .article-image-container {
      /* Regular cards - fixed height, will zoom short images */
      height: 250px;
      min-height: 250px;
      max-height: 250px;
    }

    /* All cards use cover on desktop to zoom if needed */
    .article-image {
      object-fit: cover;
      height: 100%;
      width: 100%;
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
      color: var(--text-primary, #1a1a1a);
    }

    .article-card.featured .article-overlay {
      top: 15px;
      left: 15px;
      right: auto;
      bottom: auto;
      background: none;
    }
  }

  @media (min-width: 1024px) {
    .article-card.featured .article-title {
      font-size: 1.6rem;
    }

    .article-card:hover {
      transform: translateY(-2px);
    }

    /* Featured images can be even taller on large screens */
    .article-card.featured .article-image-container {
      min-height: 350px;
      max-height: 700px;
    }

    .article-card.featured .article-image {
      min-height: 350px;
    }

    /* Regular cards slightly taller */
    .article-image-container {
      height: 280px;
      min-height: 280px;
      max-height: 280px;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .article-text-content {
      padding: 15px;
    }

    .article-card.featured .article-text-content {
      padding: 15px 12px;
    }

    .article-card.featured .article-title {
      font-size: 1.2rem;
    }

    .article-title {
      font-size: 1rem;
    }

    /* Tighter constraints on mobile */
    .article-image-container {
      min-height: 140px;
      max-height: 350px;
    }

    .article-card.featured .article-image-container {
      min-height: 180px;
      max-height: 450px;
    }
  }

  @media (max-width: 320px) {
    .article-card.featured .article-title {
      font-size: 1.1rem;
    }

    .article-image-container {
      min-height: 120px;
      max-height: 300px;
    }
  }

  /* Accessibility */
  .article-cta:focus,
  .article-title a:focus {
    outline: 3px solid rgba(215, 48, 39, 0.5);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    .article-title a {
      display: block;
      padding: 5px 0;
    }
  }
</style>