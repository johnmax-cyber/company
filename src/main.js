// Main entry point for Faith & Fashion Nairobi
import { HomePage } from './pages/home.js';
import { ShopPage } from './pages/shop.js';
import { CartPage } from './pages/cart.js';
import { ProductPage } from './pages/product.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
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