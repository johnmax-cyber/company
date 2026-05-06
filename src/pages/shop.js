// Shop page component for Faith & Fashion Nairobi
import { productService } from '../services/product-service.js';
import { cartService } from '../services/cart-service.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';

export class ShopPage {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
  }

  // Initialize the shop page
  async init() {
    // Initialize header and footer
    await header.init();
    footer.init();
    
    // Load products
    await this.loadProducts();
    
    // Render products
    this.renderProducts();
    
    // Setup search and filters
    this.setupSearch();
    this.setupFilters();
  }

  // Load products from service
  async loadProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const subcategory = urlParams.get('subcategory');
    
    try {
      // Show loading spinner
      const grid = document.getElementById('productsGrid');
      if (grid) {
        grid.innerHTML = '<div style="text-align:center;padding:2rem;">Loading products...</div>';
      }
      
      if (category) {
        // Filter by category/subcategory
        this.products = await productService.getProductsByCategory(category, subcategory || 'all');
      } else {
        // Load all products
        this.products = await productService.getProducts();
      }
      
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products for shop:', error);
      this.products = [];
      this.filteredProducts = [];
      
      // Show error message
      const grid = document.getElementById('productsGrid');
      if (grid) {
        grid.innerHTML = `
          <div style="text-align:center;padding:2rem;">
            <p>Sorry, we're experiencing technical difficulties loading products.</p>
            <p>Please try again later.</p>
          </div>
        `;
      }
    }
  }

  // Render products
  renderProducts() {
    const grid = document.getElementById('productsGrid');
    const resultCount = document.getElementById('resultCount');
    
    if (!grid) return;
    
    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <p>No products found.</p>
        </div>
      `;
      if (resultCount) resultCount.textContent = 'No products found';
      return;
    }
    
    // Update result count
    if (resultCount) {
      resultCount.textContent = `Showing ${this.filteredProducts.length} product${this.filteredProducts.length === 1 ? '' : 's'}`;
    }
    
    // Render product cards
    grid.innerHTML = '';
    this.filteredProducts.forEach(product => {
      const card = this.createProductCard(product);
      grid.appendChild(card);
    });
  }

  // Create product card element
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <div class="product-image">
        ${product.icon ? `<span class="product-icon">${product.icon}</span>` : `<span class="product-icon">🛍️</span>`}
        ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy">` : ''}
        ${!product.in_stock ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">KSh ${product.price ? product.price.toLocaleString() : '0'}</p>
        ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
          ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    `;
    
    // Add to cart button handler
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        if (product.in_stock) {
          cartService.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || '',
            qty: 1
          });
          this.showToast(`${product.name} added to cart`);
          this.updateCartCount();
        }
      });
    }
    
    return card;
  }

  // Setup search functionality
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput) return;
    
    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      
      if (!query) {
        this.filteredProducts = [...this.products];
        this.renderProducts();
        return;
      }
      
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query)
      );
      
      this.renderProducts();
    };
    
    // Search button click
    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Live search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(performSearch, 300);
    });
  }

  // Setup category filters
  setupFilters() {
    const filterLinks = document.querySelectorAll('.filter-link');
    
    filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const category = link.dataset.category;
        const subcategory = link.dataset.subcategory;
        
        let filtered = [...this.products];
        
        if (category && category !== 'all') {
          filtered = filtered.filter(p => p.category === category);
          
          if (subcategory && subcategory !== 'all') {
            filtered = filtered.filter(p => p.subcategory === subcategory);
          }
        }
        
        this.filteredProducts = filtered;
        this.renderProducts();
      });
    });
  }

  // Show toast notification
  showToast(message) {
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

  // Update cart count
  updateCartCount() {
    const cart = cartService.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
  }
}
