<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';
  
  let user = null;
  let token = '';
  let loading = true;
  let error = '';
  
  // Form data
  let title = '';
  let summary = '';
  let article_text = '';
  let image = '';
  let category = 'General';
  let featured = false;
  let submitting = false;
  let submitMessage = '';
  
  onMount(() => {
    // Check if user is logged in
    token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Not logged in, redirect to login page
      goto('/admin/login');
      return;
    }
    
    try {
      user = JSON.parse(userData);
      loading = false;
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      goto('/admin/login');
    }
  });
  
  async function handleSubmit(event) {
    event.preventDefault();
    submitting = true;
    submitMessage = '';
    error = '';
    
    try {
      const articleData = {
        title,
        summary,
        article_text,
        image,
        category,
        featured,
        date: new Date()
      };
      
      const response = await fetch(`${PUBLIC_API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit article');
      }
      
      // Clear form
      title = '';
      summary = '';
      article_text = '';
      image = '';
      category = 'General';
      featured = false;
      
      submitMessage = 'Article successfully published!';
      
    } catch (err) {
      error = err.message;
    } finally {
      submitting = false;
    }
  }
  
  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    goto('/admin/login');
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Political Gossips</title>
</svelte:head>

{#if loading}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else}
  <div class="dashboard-container">
    <header class="admin-header glass-panel">
      <h1>Admin Dashboard</h1>
      <div class="user-info">
        <span>Welcome, {user.username}</span>
        <button class="logout-btn" on:click={handleLogout}>Logout</button>
      </div>
    </header>
    
    <main class="dashboard-content">
      <div class="article-form glass-panel">
        <h2>Create New Article</h2>
        
        {#if error}
          <div class="error-message">
            <p>{error}</p>
          </div>
        {/if}
        
        {#if submitMessage}
          <div class="success-message">
            <p>{submitMessage}</p>
          </div>
        {/if}
        
        <form on:submit={handleSubmit}>
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              type="text" 
              id="title" 
              bind:value={title} 
              required 
              disabled={submitting}
            />
          </div>
          
          <div class="form-group">
            <label for="summary">Summary</label>
            <textarea 
              id="summary" 
              bind:value={summary} 
              rows="3" 
              required 
              disabled={submitting}
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="article_text">Article Content</label>
            <textarea 
              id="article_text" 
              bind:value={article_text} 
              rows="10" 
              required 
              disabled={submitting}
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="image">Image URL</label>
            <input 
              type="text" 
              id="image" 
              bind:value={image} 
              required 
              disabled={submitting}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="category">Category</label>
              <select 
                id="category" 
                bind:value={category} 
                disabled={submitting}
              >
                <option value="General">General</option>
                <option value="Political">Political</option>
              </select>
            </div>
            
            <div class="form-group half checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  bind:checked={featured} 
                  disabled={submitting}
                />
                Featured Article
              </label>
            </div>
          </div>
          
          <button type="submit" class="submit-btn" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </form>
      </div>
    </main>
  </div>
{/if}

<style>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .admin-header h1 {
    margin: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logout-btn {
    padding: 0.5rem 1rem;
    background-color: rgba(220, 53, 69, 0.85);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .logout-btn:hover {
    background-color: rgba(220, 53, 69, 1);
  }
  
  .article-form {
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
  }
  
  .half {
    flex: 1;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #333;
    font-family: inherit;
  }
  
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: rgba(44, 62, 80, 0.5);
  }
  
  .checkbox-group {
    display: flex;
    align-items: center;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox-label input {
    width: auto;
    margin-right: 0.5rem;
  }
  
  .submit-btn {
    padding: 0.8rem 1.5rem;
    background: rgba(44, 62, 80, 0.85);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-weight: 500;
  }
  
  .submit-btn:hover:not(:disabled) {
    background: rgba(44, 62, 80, 1);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .success-message {
    padding: 0.8rem;
    margin-bottom: 1.5rem;
    color: #155724;
    background-color: rgba(212, 237, 218, 0.7);
    border-radius: 4px;
    text-align: center;
  }
  
  .error-message {
    padding: 0.8rem;
    margin-bottom: 1.5rem;
    color: #721c24;
    background-color: rgba(248, 215, 218, 0.7);
    border-radius: 4px;
    text-align: center;
  }
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(44, 62, 80, 0.1);
    border-radius: 50%;
    border-top: 4px solid rgba(44, 62, 80, 0.8);
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>