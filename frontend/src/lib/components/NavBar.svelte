<script>
  import { theme } from '$lib/stores/theme';
  import { Sun, Moon } from 'lucide-svelte';
  export let brand = "Brand";
  export let links = [];
  export let sticky = true;
  
  let isOpen = false;
  
  function toggleMenu() {
    isOpen = !isOpen;
  }
  
  function closeMenu() {
    isOpen = false;
  }

  function toggleTheme() {
    theme.toggle();
  }
</script>

<nav class:sticky class="navbar" class:dark={$theme === 'dark'}>
  <div class="navbar-container">
    <div class="brand">
      <a href="/" class="brand-link">{brand}</a>
    </div>
    
    <div class="right-section">
      <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
        {#if $theme === 'dark'}
          <Sun size={20} />
        {:else}
          <Moon size={20} />
        {/if}
      </button>
      
      <div class="links" class:open={isOpen}>
        {#each links as link}
          <a 
            href={link.href} 
            class="nav-link"
            class:active={link.active} 
            on:click={closeMenu}
          >
            {link.label}
          </a>
        {/each}
      </div>
      
      <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle navigation menu">
        <span class="hamburger" class:active={isOpen}></span>
      </button>
    </div>
  </div>
</nav>

<style>
  .navbar {
    --navbar-bg: rgba(255, 255, 255, 0.95);
    --navbar-border: rgba(0, 0, 0, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.1);
    --text-primary: #1a1a1a;
    --text-secondary: #555555;
    --text-primary-hover: #000000;
    --btn-hover-bg: rgba(0, 0, 0, 0.05);
    --menu-bg: rgba(255, 255, 255, 0.95);
    
    background: var(--navbar-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--navbar-border);
    box-shadow: 0 4px 15px var(--shadow-color);
    padding: 0.8rem 0;
    width: 100%;
    z-index: 1000;
    transition: all 0.3s ease;
  }
  
  .navbar.dark {
    --navbar-bg: rgba(26, 26, 26, 0.95);
    --navbar-border: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.3);
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --text-primary-hover: #ffffff;
    --btn-hover-bg: rgba(255, 255, 255, 0.1);
    --menu-bg: rgba(26, 26, 26, 0.95);
  }
  
  .sticky {
    position: fixed;
    top: 0;
    left: 0;
  }
  
  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .brand {
    font-size: 1.5rem;
    font-weight: 600;
    flex-shrink: 0;
    font-family: 'Helvetica Neue', Arial, sans-serif;

  }
  
  .brand-link {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .brand-link:hover {
    color: var(--text-primary-hover);
  }
  
  .right-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .theme-toggle {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
    color: var(--text-primary);
  }

  .theme-toggle:hover {
    background-color: var(--btn-hover-bg);
    transform: scale(1.1);
  }
  
  .links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-right: 0;
    margin-left: 0;
  }
  
  .nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-family: 'Helvetica Neue', Arial, sans-serif;

    position: relative;
    padding: 0.5rem 0;
    transition: all 0.3s ease;
  }
  
  .nav-link:hover,
  .nav-link.active {
    color: var(--text-primary);
  }
  
  .nav-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #c41e3a;
    transition: width 0.3s ease;
  }
  
  .nav-link:hover::after,
  .nav-link.active::after {
    width: 100%;
  }
  
  .menu-toggle {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .hamburger {
    position: relative;
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    transition: all 0.3s ease;
  }
  
  .hamburger::before,
  .hamburger::after {
    content: "";
    position: absolute;
    left: 0;
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    transition: all 0.3s ease;
  }
  
  .hamburger::before {
    top: -7px;
  }
  
  .hamburger::after {
    top: 7px;
  }
  
  .hamburger.active {
    background: transparent;
  }
  
  .hamburger.active::before {
    transform: rotate(45deg);
    top: 0;
  }
  
  .hamburger.active::after {
    transform: rotate(-45deg);
    top: 0;
  }
  
  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
      z-index: 20;
    }
    
    .links {
      position: fixed;
      top: 0;
      right: 0;
      flex-direction: column;
      background: var(--menu-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: -5px 0 15px var(--shadow-color);
      height: 100vh;
      width: 250px;
      padding: 5rem 2rem 2rem;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      z-index: 10;
      margin-right: 0;
    }
    
    .links.open {
      transform: translateX(0);
    }

    .right-section {
      gap: 1rem;
    }
  }
</style>