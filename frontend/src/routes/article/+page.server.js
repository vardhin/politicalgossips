import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ url }) {
  const articleId = url.searchParams.get('id');
  
  if (!articleId) {
    return {
      article: null,
      error: 'No article ID provided'
    };
  }

  try {
    const response = await fetch(`${PUBLIC_API_URL}/api/articles/${articleId}`);
    
    if (!response.ok) {
      return {
        article: null,
        error: `Failed to fetch article: ${response.statusText}`
      };
    }
    
    const article = await response.json();
    
    return {
      article,
      error: null
    };
  } catch (err) {
    console.error('Error fetching article:', err);
    return {
      article: null,
      error: err.message
    };
  }
}