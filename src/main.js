// Main entry point for Faith & Fashion Nairobi
import { HomePage } from './pages/home.js';
import { ShopPage } from './pages/shop.js';
import { CartPage } from './pages/cart.js';
import { ProductPage } from './pages/product.js';

// Initialize design system with modern tokens
function initializeDesignSystem() {
  const root = document.documentElement;
  const designTokens = {
    '--primary': '#022448',
    '--secondary': '#b52426',
    '--background': '#f9f9ff',
    '--surface': '#ffffff',
    '--on-surface': '#111c2c',
    '--surface-variant': '#d8e3fa',
    '--outline': '#74777f',
    '--radius': '1rem',
    '--radius-lg': '2rem',
    '--font-family-heading': 'Playfair Display, serif',
    '--font-family-body': 'Inter, sans-serif',
    '--glass-bg': 'rgba(255, 255, 255, 0.7)',
    '--glass-border': 'rgba(255, 255, 255, 0.3)',
    '--shadow-sm': '0 2px 8px rgba(30, 58, 95, 0.08)',
    '--shadow-md': '0 20px 40px rgba(30, 58, 95, 0.08)',
    '--shadow-lg': '0 30px 60px rgba(30, 58, 95, 0.12)',
    '--text-light': '#64748b'
  };
  
  Object.entries(designTokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Global enhancements
function addGlobalEnhancements() {
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Enhanced header with glass effect on scroll
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.85)';
        header.style.backdropFilter = 'blur(12px)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.05)';
      } else {
        header.style.background = 'var(--surface)';
        header.style.backdropFilter = 'none';
        header.style.borderBottom = '1px solid var(--border)';
      }
    }, { passive: true });
  }

  // Add entrance animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card, .category-card, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize design system first
    initializeDesignSystem();
    
    const path = window.location.pathname;
    let page;
    
    // Detect which page to initialize based on URL path
    if (path.includes('/shop')) {
      page = new ShopPage();
    } else if (path.includes('/cart')) {
      page = new CartPage();
    } else if (path.includes('/product')) {
      page = new ProductPage();
    } else {
      page = new HomePage();
    }
    
    await page.init();
    
    // Add global enhancements after page load
    addGlobalEnhancements();
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show error message to user
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.innerHTML = `
        <div class="error-message">
          <p>Sorry, we're experiencing technical difficulties. Please try again later.</p>
        </div>
      `;
    }
  }
});