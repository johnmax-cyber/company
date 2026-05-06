// Product detail page component for Faith & Fashion Nairobi
import { productService } from '../services/product-service.js';
import { cartService } from '../services/cart-service.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';

export class ProductPage {
  constructor() {
    this.product = null;
    this.relatedProducts = [];
  }

  // Initialize the product page
  async init() {
    // Initialize header and footer
    await header.init();
    footer.init();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
      this.showError('Product not found');
      return;
    }
    
    // Load product
    await this.loadProduct(parseInt(productId));
    
    // Render product
    this.renderProduct();
    
    // Load related products
    await this.loadRelatedProducts();
  }

  // Load product by ID
  async loadProduct(id) {
    try {
      this.product = await productService.getProductById(id);
      
      if (!this.product) {
        this.showError('Product not found');
        return;
      }
    } catch (error) {
      console.error(`Error loading product ${id}:`, error);
      this.showError('Failed to load product');
    }
  }

  // Render product
  renderProduct() {
    const productDetail = document.getElementById('productDetail');
    if (!productDetail || !this.product) return;
    
    productDetail.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-detail-image">
          ${this.product.image_url ? `
            <img src="${this.product.image_url}" alt="${this.product.name}" loading="lazy">
          ` : `
            <div class="product-icon-large">${this.product.icon || '🛍️'}</div>
          `}
        </div>
        
        <div class="product-detail-info">
          <h1>${this.product.name}</h1>
          <div class="product-price">KSh ${this.product.price ? this.product.price.toLocaleString() : '0'}</div>
          
          <div class="product-meta">
            <span class="product-category">${this.product.category}</span>
            ${this.product.subcategory ? `<span class="product-subcategory">${this.product.subcategory}</span>` : ''}
            ${this.product.in_stock ? '<span class="in-stock-badge">In Stock</span>' : '<span class="out-of-stock-badge">Out of Stock</span>'}
          </div>
          
          ${this.product.description ? `
            <div class="product-description">
              <h3>Description</h3>
              <p>${this.product.description}</p>
            </div>
          ` : ''}
          
          <div class="product-actions">
            ${this.product.in_stock ? `
              <button class="btn btn-primary btn-large" id="addToCartBtn">
                Add to Cart
              </button>
            ` : `
              <button class="btn btn-primary btn-large" disabled>
                Out of Stock
              </button>
            `}
            <a href="shop.html" class="btn btn-outline">← Back to Shop</a>
          </div>
        </div>
      </div>
    `;
    
    // Add to cart button handler
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        cartService.addItem({
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          image: this.product.image_url || '',
          qty: 1
        });
        this.showToast(`${this.product.name} added to cart`);
        this.updateCartCount();
      });
    }
  }

  // Load related products
  async loadRelatedProducts() {
    if (!this.product) return;
    
    try {
      // Get products from same category, excluding current product
      this.relatedProducts = await productService.getProductsByCategory(this.product.category);
      this.relatedProducts = this.relatedProducts.filter(p => p.id !== this.product.id);
      
      // Show first 4 related products
      this.relatedProducts = this.relatedProducts.slice(0, 4);
      
      this.renderRelatedProducts();
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  // Render related products
  renderRelatedProducts() {
    const relatedSection = document.getElementById('relatedSection');
    const relatedContainer = document.getElementById('relatedProducts');
    
    if (!relatedSection || !relatedContainer || this.relatedProducts.length === 0) {
      if (relatedSection) relatedSection.style.display = 'none';
      return;
    }
    
    relatedSection.style.display = 'block';
    relatedContainer.innerHTML = '';
    
    this.relatedProducts.forEach(product => {
      const card = this.createRelatedProductCard(product);
      relatedContainer.appendChild(card);
    });
  }

  // Create related product card
  createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <div class="product-image">
        ${product.icon ? `<span class="product-icon">${product.icon}</span>` : `<span class="product-icon">🛍️</span>`}
        ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy">` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">KSh ${product.price ? product.price.toLocaleString() : '0'}</p>
        <a href="product.html?id=${product.id}" class="btn btn-outline" style="margin-top:0.5rem;">View Details</a>
      </div>
    `;
    
    return card;
  }

  // Show error message
  showError(message) {
    const productDetail = document.getElementById('productDetail');
    if (productDetail) {
      productDetail.innerHTML = `
        <div class="error-message" style="text-align:center;padding:3rem;">
          <h2>${message}</h2>
          <p>The product you're looking for may have been removed or doesn't exist.</p>
          <a href="shop.html" class="btn btn-primary" style="margin-top:1rem;">Browse Products</a>
        </div>
      `;
    }
  }

  // Update cart count
  updateCartCount() {
    const cart = cartService.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
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
}
