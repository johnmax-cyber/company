// Home page component for Faith & Fashion Nairobi
import { productService } from '../services/product-service.js';
import { cartService } from '../services/cart-service.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';
import { productCardManager } from '../components/product-card.js';

export class HomePage {
  constructor() {
    this.products = [];
    this.bestSellers = [];
    this.newArrivals = [];
  }

  // Initialize the home page
  async init() {
    // Initialize header and footer
    await header.init();
    footer.init();
    
    // Load products
    await this.loadProducts();
    
    // Render products
    this.renderHomepageProducts();
    
    // Setup toast function globally
    window.showToast = this.showToast.bind(this);
    window.addToCartQuick = this.addToCartQuick.bind(this);
    window.updateCartCount = this.updateCartCount.bind(this);
  }

  // Load products from service
  async loadProducts() {
    try {
      this.products = await productService.getProducts();
      
      // Process products for homepage sections
      this.processProducts();
    } catch (error) {
      console.error('Error loading products for homepage:', error);
      // Fallback to empty arrays
      this.products = [];
      this.bestSellers = [];
      this.newArrivals = [];
    }
  }

  // Process products for different sections
  processProducts() {
    // Best sellers: in stock, sorted by rating (assuming rating field exists)
    this.bestSellers = this.products
      .filter(p => p.in_stock)
      .sort((a, b) => {
        // If rating doesn't exist, use ID as fallback
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 8);
    
    // New arrivals: in stock and tagged as 'New'
    this.newArrivals = this.products
      .filter(p => p.in_stock && p.tags && p.tags.includes('New'))
      .slice(0, 4);
    
    // If not enough new arrivals, fill with recent products
    if (this.newArrivals.length < 4) {
      const additional = this.products
        .filter(p => p.in_stock && !(p.tags && p.tags.includes('New')))
        .slice(0, 4 - this.newArrivals.length);
      
      this.newArrivals.push(...additional);
    }
  }

  // Render homepage products
  renderHomepageProducts() {
    const bestSellersGrid = document.getElementById('bestSellersGrid');
    const newArrivalsGrid = document.getElementById('newArrivalsGrid');
    
    if (bestSellersGrid) {
      productCardManager.setProducts(this.bestSellers);
      productCardManager.renderProductsGrid('bestSellersGrid');
    }
    
    if (newArrivalsGrid) {
      productCardManager.setProducts(this.newArrivals);
      productCardManager.renderProductsGrid('newArrivalsGrid');
    }
  }

  // Show toast notification
  showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }, 100);
  }

  // Add to cart quick function
  addToCartQuick(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const cart = cartService.getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || product.images?.[0] || '',
        qty: 1
      });
    }

    cartService.saveCart(cart);
    this.updateCartCount();
    this.showToast(`${product.name} added to cart`);
  }

  // Update cart count
  updateCartCount() {
    const cart = cartService.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
  }
}
