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
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Enhance UI with modern features
    this.enhanceShopUI();
  }

  // Load products from service
  async loadProducts() {
    try {
      this.products = await productService.getAllProducts();
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products');
    }
  }

  // Render products
  renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (!this.filteredProducts || this.filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3>No products found. Please try a different filter or check back later.</h3>
        </div>
      `;
      
      // Update result count
      const resultCount = document.getElementById('resultCount');
      if (resultCount) {
        resultCount.textContent = 'No products found';
      }
      return;
    }
    
    // Create enhanced product cards
    productsGrid.innerHTML = this.filteredProducts.map((product, index) => 
      this.createEnhancedProductCard(product, index)
    ).join('');
    
    // Update result count
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
      resultCount.textContent = this.filteredProducts.length === this.products.length 
        ? `Showing all ${this.filteredProducts.length} products` 
        : `Showing ${this.filteredProducts.length} of ${this.products.length} products`;
    }
    
    // Add event listeners to new cards
    this.addProductCardEventListeners();
  }
  
  // Create enhanced product card with modern styling and animations
  createEnhancedProductCard(product, index) {
    // Determine badge
    let badge = '';
    if (product.is_new) {
      badge = `<span class="badge-new" style="
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        z-index: 2;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      ">New Arrival</span>`;
    }
    
    // Determine if out of stock
    const isOutOfStock = !product.in_stock;
    
    return `
      <div class="product-card enhanced" data-product-id="${product.id}" style="
        background: var(--surface);
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(30, 58, 95, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid var(--border);
        position: relative;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease forwards;
        animation-delay: ${index * 0.05}s;
      ">
        ${badge}
        
        <div class="product-image-wrapper" style="position: relative; overflow: hidden;">
          ${product.image_url ? `
            <img src="${product.image_url}" alt="${product.name}" loading="lazy" style="
              width: 100%;
              height: 250px;
              object-fit: cover;
              transition: transform 0.5s ease;
            ">
          ` : `
            <div style="
              width: 100%;
              height: 250px;
              background: linear-gradient(135deg, #f0f4ff, #e6eeff);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 3rem;
            ">${product.icon || '🛍️'}</div>
          `}
          
          <div class="product-quickview-overlay" style="
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          ">
            <button class="quick-add-overlay-btn" data-id="${product.id}" style="
              background: var(--primary);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: var(--radius);
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              transform: translateY(10px);
              transition: transform 0.3s ease;
            " ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <span class="material-symbols-outlined">add_shopping_cart</span>
              ${isOutOfStock ? 'Out of Stock' : 'Quick Add'}
            </button>
          </div>
        </div>
        
        <div class="product-info" style="padding: 1.25rem;">
          <span class="product-category-tag" style="
            font-size: 0.625rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--primary);
            background: rgba(30, 58, 95, 0.05);
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            display: inline-block;
            margin-bottom: 0.5rem;
          ">${product.category}</span>
          
          <h3 class="product-title" style="
            font-family: 'Playfair Display', serif;
            font-size: 1rem;
            font-weight: 600;
            color: var(--on-surface);
            margin: 0.5rem 0;
            line-height: 1.3;
            height: 2.6em;
            overflow: hidden;
          ">${product.name}</h3>
          
          <div class="product-price" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.75rem 0;
          ">
            <span class="current-price" style="
              font-weight: 700;
              font-size: 1.1rem;
              color: ${isOutOfStock ? 'var(--text-light)' : 'var(--secondary)'};
              ${isOutOfStock ? 'text-decoration: line-through;' : ''}
            ">
              KSh ${product.price ? product.price.toLocaleString() : '0'}
            </span>
            ${isOutOfStock ? `
              <span style="
                font-size: 0.75rem;
                color: var(--secondary);
                background: rgba(239, 68, 68, 0.1);
                padding: 0.125rem 0.5rem;
                border-radius: 9999px;
              ">Out of Stock</span>
            ` : ''}
          </div>
          
          <div class="product-actions" style="margin-top: 1rem;">
            ${!isOutOfStock ? `
              <button class="btn btn-primary add-to-cart-overlay" data-id="${product.id}" style="
                width: 100%;
                background: var(--primary);
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: var(--radius);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
              " onmouseover="this.style.background='var(--primary)'" onmouseout="this.style.background='var(--primary)""">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Add to Cart
              </button>
            ` : `
              <button class="btn btn-primary" disabled style="
                width: 100%;
                background: var(--background);
                color: var(--text-light);
                border: 1px solid var(--border);
                padding: 0.75rem;
                border-radius: var(--radius);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: not-allowed;
              ">
                Out of Stock
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }
  
  // Add event listeners to product cards
  addProductCardEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-overlay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.id);
        const product = this.getProductById(productId);
        if (product) {
          this.handleQuickAdd(product);
        }
      });
    });
    
    // Quick add overlay buttons
    document.querySelectorAll('.quick-add-overlay-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.id);
        const product = this.getProductById(productId);
        if (product && !btn.disabled) {
          this.handleQuickAdd(product);
        }
      });
    });
    
    // Card hover effects
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(30, 58, 95, 0.12)';
        
        const overlay = e.currentTarget.querySelector('.product-quickview-overlay');
        if (overlay) {
          overlay.style.opacity = '1';
          overlay.querySelector('.quick-add-overlay-btn').style.transform = 'translateY(0)';
        }
        
        const image = e.currentTarget.querySelector('img');
        if (image) {
          image.style.transform = 'scale(1.05)';
        }
      });
      
      card.addEventListener('mouseleave', (e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 95, 0.08)';
        
        const overlay = e.currentTarget.querySelector('.product-quickview-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          if (overlay.querySelector('.quick-add-overlay-btn')) {
            overlay.querySelector('.quick-add-overlay-btn').style.transform = 'translateY(10px)';
          }
        }
        
        const image = e.currentTarget.querySelector('img');
        if (image) {
          image.style.transform = 'scale(1)';
        }
      });
    });
    
    // Click on card to view product details (optional enhancement)
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on buttons
        if (e.target.closest('button')) return;
        
        const productId = card.dataset.productId;
        if (productId) {
          window.location.href = `product.html?id=${productId}`;
        }
      });
    });
  }
  
  // Setup event listeners for filters and search
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(searchInput.value);
        }
      });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.handleSort(e.target.value);
      });
    }
    
    // Category filter
    document.querySelectorAll('.filter-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        // Get filter values
        const category = e.target.dataset.category;
        const subcategory = e.target.dataset.subcategory;
        
        this.applyFilters(category, subcategory);
      });
    });
  }
  
  // Handle search
  handleSearch(query) {
    if (!query || query.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      const searchTerm = query.toLowerCase().trim();
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    this.renderProducts();
    this.enhanceProductGrid();
  }
  
  // Handle sorting
  handleSort(sortBy) {
    switch (sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Reset to original order (you might want to implement featured logic)
        this.filteredProducts = [...this.products].filter(p => 
          this.filteredProducts.some(fp => fp.id === p.id)
        );
        break;
    }
    
    this.renderProducts();
    this.enhanceProductGrid();
  }
  
  // Apply category filters
  applyFilters(category, subcategory) {
    if (category === 'all' && subcategory === 'all') {
      this.filteredProducts = [...this.products];
    } else if (subcategory && subcategory !== 'all') {
      this.filteredProducts = this.products.filter(p => 
        p.category === category && p.subcategory === subcategory
      );
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    
    this.renderProducts();
    this.enhanceProductGrid();
  }
  
  // Get product by ID
  getProductById(id) {
    return this.products.find(p => p.id === id);
  }
  
  // Handle quick add
  handleQuickAdd(product) {
    cartService.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      qty: 1
    });
    
    this.showToast(`${product.name} added to cart`, 'success');
    this.updateCartCount();
  }
  
  // Enhance shop UI with modern effects
  enhanceShopUI() {
    this.addGlassEffectToFilters();
    this.enhanceProductGrid();
    this.enhanceSortingUI();
  }
  
  // Add glass effect to filter section
  addGlassEffectToFilters() {
    const filterSection = document.querySelector('.product-filters');
    if (filterSection) {
      // Add subtle styling
      filterSection.style.cssText = `
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 1rem;
        margin-bottom: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.5);
      `;
      
      // Style filter links
      const filterLinks = filterSection.querySelectorAll('.filter-link');
      filterLinks.forEach(link => {
        link.style.cssText = `
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          color: var(--on-surface);
          font-size: 0.875rem;
          font-weight: 500;
        `;
        
        link.addEventListener('mouseenter', () => {
          if (!link.classList.contains('active')) {
            link.style.background = 'rgba(30, 58, 95, 0.05)';
          }
        });
        
        link.addEventListener('mouseleave', () => {
          if (!link.classList.contains('active')) {
            link.style.background = 'transparent';
          }
        });
      });
      
      // Style active link
      const activeLink = filterSection.querySelector('.filter-link.active');
      if (activeLink) {
        activeLink.style.cssText = `
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: var(--primary);
          color: white;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          font-size: 0.875rem;
        `;
      }
    }
  }
  
  // Enhance product grid with entrance animations
  enhanceProductGrid() {
    const cards = document.querySelectorAll('.product-card');
    
    // Add staggered entrance animation
    cards.forEach((card, index) => {
      card.style.animation = 'fadeInUp 0.6s ease forwards';
      card.style.animationDelay = `${index * 0.05}s`;
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    });
    
    // Trigger animations
    setTimeout(() => {
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }, 50);
  }
  
  // Enhance sorting UI
  enhanceSortingUI() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.style.cssText = `
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid var(--border);
        background: white;
        color: var(--on-surface);
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 150px;
      `;
      
      sortSelect.addEventListener('focus', () => {
        sortSelect.style.borderColor = 'var(--primary)';
        sortSelect.style.boxShadow = '0 0 0 2px rgba(2, 36, 72, 0.1)';
      });
      
      sortSelect.addEventListener('blur', () => {
        sortSelect.style.borderColor = 'var(--border)';
        sortSelect.style.boxShadow = 'none';
      });
    }
  }
  
  // Show toast notification
  showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    const colors = {
      success: 'var(--primary)',
      warning: '#f59e0b',
      error: 'var(--secondary)'
    };
    
    const icons = {
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };
    
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius);
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 1.25rem;">${icons[type]}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Update cart count in header
  updateCartCount() {
    const cart = cartService.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
  }
  
  // Show error message
  showError(message) {
    const container = document.getElementById('productsGrid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h2>${message}</h2>
          <p>Please try again later.</p>
        </div>
      `;
    }
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);