<script>
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { theme } from '../../lib/stores/theme';
  import '../../lib/styles/theme.css';
  import NavBar from '../../lib/components/NavBar.svelte';

  // Navigation links for the navbar
  const navLinks = [
    { href: "/", label: "HOME", active: false },
    { href: "/category/general", label: "GENERAL", active: false },
    { href: "/category/political", label: "POLITICAL", active: false },
    { href: "/category/crime", label: "CRIME", active: false },
    { href: "/contact", label: "CONTACT US", active: true },
  ];

  // Contact form state
  let contactName = '';
  let contactEmail = '';
  let contactMessage = '';
  let contactSubmitting = false;
  let contactResult = null;

  // Add reactive statement to update body class
  $: {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', $theme === 'dark');
    }
  }

  // Function to handle contact form submission
  async function handleContactSubmit(e) {
    e.preventDefault();
    
    if (contactSubmitting) return;
    
    try {
      contactSubmitting = true;
      contactResult = null;

      // Create EmailJS service or use your backend API
      const response = await fetch(`${PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName || 'Anonymous',
          email: contactEmail || 'No contact provided',
          message: contactMessage,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Reset form on success
        contactName = '';
        contactEmail = '';
        contactMessage = '';
        contactResult = { success: true, message: 'Your message has been sent securely!' };
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (err) {
      console.error('Error submitting contact form:', err);
      contactResult = { success: false, message: 'Failed to send message. Please try again or use alternative contact methods.' };
    } finally {
      contactSubmitting = false;
    }
  }

  onMount(() => {
    // Set initial body class
    document.body.classList.toggle('dark', $theme === 'dark');
  });
</script>

<svelte:head>
  <title>Contact Us - Political Gossips</title>
  <meta name="description" content="Contact Political Gossips securely. Submit tips, provide information, or reach out to our investigative team.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="site-wrapper" class:dark={$theme === 'dark'}>
  <NavBar brand="POLITICAL GOSSIPS" links={navLinks} sticky={true} />
  
  <main class="main-content">
    <!-- Page Header -->
    <section class="page-header">
      <h1 class="page-title">CONTACT US</h1>
      <p class="page-subtitle">Secure communication for whistleblowers and sources</p>
    </section>

    <div class="contact-content">
      <!-- Contact Information -->
      <section class="contact-info-section">
        <div class="info-card">
          <h2>Confidential Sources</h2>
          <p>Our investigative team is committed to protecting whistleblowers and sources. All communications are handled with the highest level of security and confidentiality.</p>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <h3>🔐 Security Notice</h3>
          <ul>
            <li>We use encrypted communication channels</li>
            <li>Source protection is our highest priority</li>
            <li>No logs are kept of anonymous submissions</li>
            <li>Consider using Tor browser for maximum anonymity</li>
          </ul>
        </div>
      </section>

      <!-- Contact Form -->
      <section class="contact-form-section">
        <div class="form-card">
          <h2>Submit Information</h2>
          <p>Use this secure form to share information, tips, or reach out to our team. PGP encryption is available upon request</p>

          {#if contactResult}
            <div class="message-result {contactResult.success ? 'success' : 'error'}">
              {contactResult.message}
            </div>
          {/if}
          
          <form class="contact-form" on:submit={handleContactSubmit}>
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name (Optional)</label>
                <input 
                  type="text" 
                  id="name"
                  bind:value={contactName}
                  disabled={contactSubmitting}
                  placeholder="Anonymous submissions welcome"
                />
              </div>
              <div class="form-group">
                <label for="email">Contact (Optional)</label>
                <input 
                  type="email" 
                  id="email"
                  bind:value={contactEmail}
                  disabled={contactSubmitting}
                  placeholder="For follow-up communication only"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="message">Information / Message *</label>
              <textarea 
                id="message"
                rows="8" 
                required
                bind:value={contactMessage}
                disabled={contactSubmitting}
                placeholder="Describe the situation, provide evidence details, share your concerns, or ask questions. Be as detailed as possible while protecting your identity."
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="submit-btn"
                disabled={contactSubmitting || !contactMessage.trim()}
              >
                {contactSubmitting ? 'SENDING SECURELY...' : 'SUBMIT INFORMATION'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Political Gossips</h4>
        <p>Independent investigative journalism exposing political corruption and holding power accountable.</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copyright">
        &copy; {new Date().getFullYear()} Political Gossips. Independent journalism in the public interest.
      </div>
    </div>
  </footer>
</div>

<style>
  /* Import theme variables */
  .site-wrapper {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --bg-tertiary: #e8e8e8;
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --text-tertiary: #666666;
    --text-muted: #888888;
    --border-color: #d0d0d0;
    --border-light: #e8e8e8;
    --shadow-light: rgba(0, 0, 0, 0.05);
    --shadow-medium: rgba(0, 0, 0, 0.1);
    --shadow-heavy: rgba(0, 0, 0, 0.2);
    --accent-color: #d73027;
    --accent-hover: #b71c1c;
    --warning-color: #f57c00;
    --success-bg: #e8f5e8;
    --success-text: #2e7d32;
    --success-border: #4caf50;
    --error-bg: #ffebee;
    --error-text: #c62828;
    --error-border: #e57373;
    
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: 80px;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .site-wrapper.dark {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #2a2a2a;
    --text-primary: #e5e5e5;
    --text-secondary: #b8b8b8;
    --text-tertiary: #888888;
    --text-muted: #666666;
    --border-color: #333333;
    --border-light: #2a2a2a;
    --shadow-light: rgba(0, 0, 0, 0.3);
    --shadow-medium: rgba(0, 0, 0, 0.5);
    --shadow-heavy: rgba(0, 0, 0, 0.7);
    --accent-color: #ef5350;
    --accent-hover: #d32f2f;
  }

  .main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
  }

  /* Page Header */
  .page-header {
    text-align: center;
    padding: 40px 0;
    border-bottom: 3px solid var(--accent-color);
    margin-bottom: 40px;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 15px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
  }

  /* Contact Content */
  .contact-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  /* Contact Info Section */
  .contact-info-section {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .info-card, .form-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: 30px;
    box-shadow: 0 2px 10px var(--shadow-light);
  }

  .info-card h2, .form-card h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .info-card p, .form-card p {
    color: var(--text-secondary);
    margin: 0 0 25px;
    line-height: 1.6;
  }

  /* Contact Methods */
  .contact-methods {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .contact-method {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    transition: all 0.3s ease;
  }

  .contact-method:hover {
    box-shadow: 0 4px 12px var(--shadow-medium);
  }

  .method-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .method-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .method-details strong {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
  }

  .method-details span {
    color: var(--accent-color);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .method-details small {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  /* Security Notice */
  .security-notice {
    background: var(--bg-tertiary);
    border-left: 4px solid var(--warning-color);
    padding: 25px;
  }

  .security-notice h3 {
    color: var(--text-primary);
    margin: 0 0 15px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .security-notice ul {
    margin: 0;
    padding-left: 20px;
    color: var(--text-secondary);
  }

  .security-notice li {
    margin-bottom: 8px;
    line-height: 1.5;
  }

  /* Contact Form */
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-group input,
  .form-group textarea {
    padding: 15px;
    border: 2px solid var(--border-color);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s ease;
    background: var(--bg-primary);
    color: var(--text-primary);
    box-sizing: border-box;
    width: 100%;
    resize: vertical;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .form-actions {
    display: flex;
    justify-content: flex-start;
  }

  .submit-btn {
    background: var(--text-primary);
    color: var(--bg-primary);
    border: none;
    padding: 16px 30px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 13px;
    border: 2px solid var(--text-primary);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--accent-color);
    border-color: var(--accent-color);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Message Results */
  .message-result {
    padding: 15px;
    margin-bottom: 25px;
    font-weight: 500;
    font-size: 14px;
    border-radius: 4px;
  }

  .message-result.success {
    background: var(--success-bg);
    color: var(--success-text);
    border-left: 4px solid var(--success-border);
  }

  .message-result.error {
    background: var(--error-bg);
    color: var(--error-text);
    border-left: 4px solid var(--error-border);
  }

  /* Resources Section */
  .resources-section {
    background: var(--bg-secondary);
    padding: 40px 30px;
    border: 1px solid var(--border-color);
    margin-bottom: 40px;
  }

  .resources-section h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 25px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  .resources-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .resource-card {
    background: var(--bg-primary);
    padding: 25px;
    border: 1px solid var(--border-light);
    text-align: center;
  }

  .resource-card h3 {
    color: var(--text-primary);
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .resource-card p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* Footer Styles */
  .site-footer {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 40px 0 20px;
    margin-top: auto;
    border-top: 3px solid var(--accent-color);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-section h4 {
    font-size: 1rem;
    font-weight: 800;
    margin: 0 0 15px;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .footer-section p {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li {
    margin-bottom: 8px;
  }

  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .footer-links a:hover {
    color: var(--accent-color);
  }

  .footer-bottom {
    border-top: 1px solid var(--border-color);
    margin-top: 30px;
    padding-top: 20px;
    text-align: center;
  }

  .copyright {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (min-width: 768px) {
    .main-content {
      padding: 0 30px;
    }

    .contact-content {
      grid-template-columns: 1fr 1fr;
      gap: 50px;
    }

    .form-row {
      grid-template-columns: 1fr 1fr;
    }

    .resources-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .footer-content {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }
  }

  @media (min-width: 1024px) {
    .page-header {
      padding: 60px 0;
    }

    .page-title {
      font-size: 3rem;
    }

    .info-card, .form-card {
      padding: 40px;
    }

    .resources-section {
      padding: 60px 40px;
    }
  }

  @media (max-width: 480px) {
    .site-wrapper {
      padding-top: 70px;
    }

    .main-content {
      padding: 0 10px;
    }

    .page-header {
      padding: 30px 0;
    }

    .page-title {
      font-size: 2rem;
    }

    .info-card, .form-card {
      padding: 20px;
    }

    .contact-method {
      padding: 15px;
    }

    .resources-section {
      padding: 30px 20px;
    }
  }
</style>