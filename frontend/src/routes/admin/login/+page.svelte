<script>
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  
  let username = '';
  let password = '';
  let error = '';
  let loading = false;
  let backendStatus = 'Checking...';

  onMount(async () => {
    await checkBackendConnection();
  });

  async function checkBackendConnection() {
    try {
      // Define endpoints to try in order
      const endpoints = [
        `${PUBLIC_API_URL}/health`,
        `${PUBLIC_API_URL}/api/health`,
        `${PUBLIC_API_URL}` // Try root as last resort
      ];
      
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log('Checking backend connection at:', endpoint);
          const response = await fetch(endpoint);
          
          // Try to parse response regardless of content type
          const text = await response.text();
          let data;
          
          try {
            data = JSON.parse(text);
            console.log('Backend response data:', data);
            
            // If we have status info, use it
            if (data.status && data.dbState) {
              backendStatus = `Backend: ${data.status}, DB: ${data.dbState}`;
            } else if (data.status) {
              backendStatus = `Backend: ${data.status}`;
            } else {
              backendStatus = 'Backend connected';
            }
            
            return true; // Successfully connected
          } catch (parseError) {
            console.warn('Response not valid JSON:', text.substring(0, 100));
            throw new Error('Invalid JSON response');
          }
        } catch (err) {
          lastError = err;
          console.warn(`Failed to connect to ${endpoint}:`, err.message);
          // Continue to next endpoint
        }
      }
      
      // If we get here, all endpoints failed
      throw lastError || new Error('All backend connection attempts failed');
      
    } catch (err) {
      console.error('Backend connection check failed:', err);
      backendStatus = 'Backend unavailable';
      return false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    loading = true;
    error = '';
    
    try {
      // Check backend connection first
      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to the backend server');
      }
      
      console.log('Sending login request to:', `${PUBLIC_API_URL}/auth/login`);
      const response = await fetch(`${PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Login response status:', response.status);
      
      // Try to parse response as JSON
      let data;
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server: ' + responseText.substring(0, 100));
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      goto('/admin/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Login - Political Gossips</title>
</svelte:head>

<div class="login-container">
  <div class="login-card glass-panel">
    <h1>Admin Login</h1>
    
    <div class="backend-status" class:error={backendStatus.includes('unavailable')}>
      {backendStatus}
    </div>
    
    {#if error}
      <div class="error-message">
        <p>{error}</p>
      </div>
    {/if}
    
    <form on:submit={handleLogin}>
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username} 
          required 
          disabled={loading}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          required 
          disabled={loading}
        />
      </div>
      
      <button type="submit" class="login-btn" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
    
    <div class="back-link">
      <a href="/">Back to Home</a>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }
  
  .login-card {
    width: 100%;
    max-width: 450px;
    padding: 2.5rem;
  }
  
  h1 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #333;
    font-family: inherit;
  }
  
  input:focus {
    outline: none;
    border-color: rgba(44, 62, 80, 0.5);
  }
  
  .login-btn {
    width: 100%;
    padding: 0.8rem 1.5rem;
    background: rgba(44, 62, 80, 0.85);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-weight: 500;
  }
  
  .login-btn:hover:not(:disabled) {
    background: rgba(44, 62, 80, 1);
  }
  
  .login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error-message {
    padding: 0.8rem;
    margin-bottom: 1.5rem;
    color: #721c24;
    background-color: rgba(248, 215, 218, 0.7);
    border-radius: 4px;
    text-align: center;
  }
  
  .back-link {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .back-link a {
    color: #2c3e50;
    text-decoration: none;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  }

  .backend-status {
    padding: 8px;
    margin-bottom: 15px;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    text-align: center;
  }
  
  .backend-status.error {
    background: rgba(255, 0, 0, 0.1);
    color: #a94442;
  }
</style>