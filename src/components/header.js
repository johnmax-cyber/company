// Header component for Faith & Fashion Nairobi
import { cartService } from '../services/cart-service.js';

export class Header {
  constructor() {
    this.cartCount = 0;
  }

  // Initialize the header
  async init() {
    this.render();
    this.updateCartCount();
    this.setupEventListeners();
  }

  // Render the header HTML
  render() {
    const headerElement = document.getElementById('header');
    if (!headerElement) return;

    headerElement.innerHTML = `
      <nav class="navbar">
        <a href="index.html" class="nav-logo">Faith & Fashion Nairobi</a>
        <div class="hamburger" onclick="header.toggleMenu()" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul class="nav-menu">
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="shop.html" class="nav-link">Shop</a></li>
          <li><a href="cart.html" class="nav-link">Cart</a></li>
          <li><a href="contact.html" class="nav-link">Contact</a></li>
        </ul>
        <div class="nav-search">
          <input
            type="text"
            id="globalSearch"
            placeholder="Search products..."
            onkeydown="if(event.key==='Enter'){
              window.location.href='shop.html?search='+encodeURIComponent(this.value)
            }"
          >
        </div>
        <div class="nav-actions">
          <a href="cart.html" class="nav-cart" aria-label="Shopping cart">
            <span class="cart-icon">🛒</span>
            <span class="cart-count" id="cartCount">${this.cartCount}</span>
          </a>
        </div>
      </nav>
    `;
  }

  // Update cart count
  updateCartCount() {
    this.cartCount = cartService.getCartCount();
    const countElement = document.getElementById('cartCount');
    if (countElement) {
      countElement.textContent = this.cartCount;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Setup mobile menu toggle
    window.header = this;
  }

  // Toggle mobile menu
  toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.header = new Header();
  window.header.init();
});