import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize with system preference or stored preference
function createThemeStore() {
  // Default to 'light', then check storage and system preference
  const defaultTheme = browser 
    ? localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : 'light';
  
  const { subscribe, set, update } = writable(defaultTheme);
  
  return {
    subscribe,
    setTheme: (theme) => {
      if (browser) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      set(theme);
    },
    toggle: () => update(current => {
      const newTheme = current === 'dark' ? 'light' : 'dark';
      if (browser) {
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      return newTheme;
    })
  };
}

export const theme = createThemeStore();