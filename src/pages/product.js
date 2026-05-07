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
    
    // Enhance UI with modern features
    this.enhanceProductUI();
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
          <div class="product-badges">
            ${this.product.in_stock ? '<span class="badge-in-stock">In Stock</span>' : '<span class="badge-out-of-stock">Out of Stock</span>'}
            <span class="badge-category">${this.product.category}</span>
          </div>
          
          <h1 class="product-title">${this.product.name}</h1>
          <div class="product-price">KSh ${this.product.price ? this.product.price.toLocaleString() : '0'}</div>
          
          <div class="product-meta">
            <span class="product-category">${this.product.category}</span>
            ${this.product.subcategory ? `<span class="product-subcategory">${this.product.subcategory}</span>` : ''}
          </div>
          
          ${this.product.description ? `
            <div class="product-description">
              <h3>Description</h3>
              <p>${this.product.description}</p>
            </div>
          ` : ''}
          
          <div class="product-actions">
            ${this.product.in_stock ? `
              <div class="quantity-selector">
                <button class="qty-btn minus" aria-label="Decrease quantity">-</button>
                <span class="qty" id="pdpQty">1</span>
                <button class="qty-btn plus" aria-label="Increase quantity">+</button>
              </div>
              <button class="btn btn-primary btn-large add-to-cart-btn" id="addToCartBtn">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Add to Cart
              </button>
              <button class="btn btn-outline btn-large quick-view-btn" id="quickViewBtn">
                <span class="material-symbols-outlined">visibility</span>
                Quick View
              </button>
            ` : `
              <button class="btn btn-primary btn-large" disabled>
                Out of Stock
              </button>
            `}
            <a href="shop.html" class="btn btn-outline btn-large">← Back to Shop</a>
          </div>
        </div>
      </div>
    `;
    
    // Add to cart button handler
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('pdpQty').textContent) || 1;
        cartService.addItem({
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          image: this.product.image_url || '',
          qty: qty
        });
        this.showToast(`${this.product.name} added to cart`);
        this.updateCartCount();
      });
    }
    
    // Quick view button handler
    const quickViewBtn = document.getElementById('quickViewBtn');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', () => this.showQuickView());
    }
    
    // Quantity selector handlers
    this.addQuantitySelectorHandlers();
  }
  
  // Enhance product UI with modern features
  enhanceProductUI() {
    this.addHoverEffects();
    this.addImageZoom();
    this.enhanceBadges();
  }
  
  // Add hover effects to product images
  addHoverEffects() {
    const productImage = document.querySelector('.product-detail-image');
    if (productImage) {
      productImage.style.transition = 'transform 0.3s ease';
      productImage.addEventListener('mouseenter', () => {
        productImage.style.transform = 'scale(1.02)';
      });
      productImage.addEventListener('mouseleave', () => {
        productImage.style.transform = 'scale(1)';
      });
    }
  }
  
  // Add image zoom on click
  addImageZoom() {
    const productImage = document.querySelector('.product-detail-image img');
    if (productImage) {
      productImage.style.cursor = 'zoom-in';
      productImage.addEventListener('click', () => this.showQuickView());
    }
  }
  
  // Enhance badge styling
  enhanceBadges() {
    const badges = document.querySelectorAll('.badge-in-stock, .badge-out-of-stock, .badge-category');
    badges.forEach(badge => {
      badge.style.cssText = `
        backdrop-filter: blur(12px);
        background: ${badge.classList.contains('badge-in-stock') ? 'rgba(16, 185, 129, 0.2)' : 
                      badge.classList.contains('badge-out-of-stock') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'};
        border: 1px solid ${badge.classList.contains('badge-in-stock') ? 'rgba(16, 185, 129, 0.3)' : 
                      badge.classList.contains('badge-out-of-stock') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'};
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
      `;
    });
  }
  
  // Show quick view modal
  showQuickView() {
    // Remove existing modal
    const existingModal = document.querySelector('.quick-view-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 1rem;
    `;
    
    modal.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 1rem;
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: modalIn 0.3s ease;
      ">
        <button class="close-modal" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">×</button>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div>
            ${this.product.image_url ? `
              <img src="${this.product.image_url}" alt="${this.product.name}" style="
                width: 100%;
                height: auto;
                border-radius: 0.5rem;
                object-fit: cover;
              ">
            ` : `
              <div style="
                width: 100%;
                height: 300px;
                background: linear-gradient(135deg, #f0f4ff, #e6eeff);
                border-radius: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 4rem;
              ">${this.product.icon || '🛍️'}</div>
            `}
          </div>
          
          <div>
            <span style="
              background: rgba(30, 58, 95, 0.1);
              color: var(--primary);
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 0.5rem;
            ">${this.product.category}</span>
            
            <h2 style="
              font-family: 'Playfair Display', serif;
              font-size: 1.75rem;
              margin: 0.5rem 0;
              color: var(--primary);
            ">${this.product.name}</h2>
            
            <div style="
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--secondary);
              margin: 1rem 0;
            ">KSh ${this.product.price ? this.product.price.toLocaleString() : '0'}</div>
            
            ${this.product.description ? `
              <div style="margin: 1.5rem 0;">
                <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Description</h4>
                <p style="color: var(--text-light); line-height: 1.7;">${this.product.description}</p>
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; align-items: center; margin: 2rem 0;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="qty-btn-minus" style="
                  width: 40px;
                  height: 40px;
                  border-radius: 0.5rem;
                  border: 1px solid #ddd;
                  background: white;
                  cursor: pointer;
                  font-weight: 600;
                ">-</button>
                <span class="quick-view-qty" style="
                  min-width: 40px;
                  text-align: center;
                  font-weight: 600;
                  font-size: 1.1rem;
                ">1</span>
                <button class="qty-btn-plus" style="
                  width: 40px;
                  height: 40px;
                  border-radius: 0.5rem;
                  border: 1px solid #ddd;
                  background: white;
                  cursor: pointer;
                  font-weight: 600;
                ">+</button>
              </div>
              
              <button class="quick-add-cart-btn" style="
                flex: 1;
                background: var(--primary);
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
              ">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeModal = () => modal.remove();
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Quantity selector in modal
    const qtyDisplay = modal.querySelector('.quick-view-qty');
    let qty = 1;
    
    modal.querySelector('.qty-btn-minus').addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        qtyDisplay.textContent = qty;
        this.updateQuickViewPrice(qty);
      }
    });
    
    modal.querySelector('.qty-btn-plus').addEventListener('click', () => {
      qty++;
      qtyDisplay.textContent = qty;
      this.updateQuickViewPrice(qty);
    });
    
    // Add to cart from modal
    modal.querySelector('.quick-add-cart-btn').addEventListener('click', () => {
      cartService.addItem({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        image: this.product.image_url || '',
        qty: qty
      });
      
      this.showToast(`${this.product.name} added to cart`);
      this.updateCartCount();
      modal.remove();
    });
  }
  
  // Update price in quick view modal
  updateQuickViewPrice(qty) {
    const priceEl = document.querySelector('.quick-view-modal .product-price-style');
    if (priceEl && this.product.price) {
      // Find the price element in the modal
      const modalPrice = document.querySelector('.quick-view-modal div[style*="font-size: 1.5rem"]');
      if (modalPrice) {
        modalPrice.textContent = `KSh ${(this.product.price * qty).toLocaleString()}`;
      }
    }
  }
  
  // Add quantity selector handlers
  addQuantitySelectorHandlers() {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('qty-btn')) {
        const qtySpan = document.getElementById('pdpQty');
        let qty = parseInt(qtySpan.textContent) || 1;
        
        if (e.target.classList.contains('plus')) {
          qty++;
        } else if (e.target.classList.contains('minus') && qty > 1) {
          qty--;
        }
        
        qtySpan.textContent = qty;
        this.updatePrice(qty);
      }
    });
  }
  
  // Update price display
  updatePrice(qty) {
    const priceElement = document.querySelector('.product-price');
    const basePrice = this.product.price;
    if (priceElement && basePrice) {
      priceElement.textContent = `KSh ${(basePrice * qty).toLocaleString()}`;
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
      const card = this.createEnhancedRelatedProductCard(product);
      relatedContainer.appendChild(card);
    });
  }
  
  // Create enhanced related product card with hover effects
  createEnhancedRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card enhanced';
    card.dataset.productId = product.id;
    card.style.cssText = `
      background: var(--surface);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid var(--border);
      position: relative;
      opacity: 0;
      transform: translateY(20px);
    `;
    
    card.innerHTML = `
      <div class="product-image-wrapper" style="position: relative; overflow: hidden;">
        ${product.image_url ? `
          <img src="${product.image_url}" alt="${product.name}" loading="lazy" style="
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.5s ease;
          ">
        ` : `<div style="
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #f0f4ff, #e6eeff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        ">${product.icon || '🛍️'}</div>`}
        
        <div class="quick-view-overlay" style="
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        ">
          <button class="quick-add-related" data-id="${product.id}" style="
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
          ">
            <span class="material-symbols-outlined">add_shopping_cart</span>
            Quick Add
          </button>
        </div>
      </div>
      
      <div class="product-info" style="padding: 1rem;">
        <span class="product-category" style="
          font-size: 0.75rem;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        ">${product.category}</span>
        <h3 class="product-title" style="
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
          line-height: 1.3;
          color: var(--on-surface);
          font-family: 'Playfair Display', serif;
        ">${product.name}</h3>
        <p class="product-price" style="
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--secondary);
        ">KSh ${product.price ? product.price.toLocaleString() : '0'}</p>
      </div>
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = 'var(--shadow-lg)';
      
      const overlay = card.querySelector('.quick-view-overlay');
      const image = card.querySelector('img');
      if (overlay) overlay.style.opacity = '1';
      if (image) image.style.transform = 'scale(1.1)';
      
      const quickAddBtn = card.querySelector('.quick-add-related');
      if (quickAddBtn) quickAddBtn.style.transform = 'translateY(0)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = 'var(--shadow-sm)';
      
      const overlay = card.querySelector('.quick-view-overlay');
      const image = card.querySelector('img');
      if (overlay) overlay.style.opacity = '0';
      if (image) image.style.transform = 'scale(1)';
      
      const quickAddBtn = card.querySelector('.quick-add-related');
      if (quickAddBtn) quickAddBtn.style.transform = 'translateY(10px)';
    });
    
    // Quick add handler
    card.querySelector('.quick-add-related').addEventListener('click', () => {
      cartService.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '',
        qty: 1
      });
      
      // Animate button
      const btn = card.querySelector('.quick-add-related');
      btn.textContent = '✓ Added!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.innerHTML = `<span class="material-symbols-outlined">add_shopping_cart</span> Quick Add`;
        btn.style.background = 'var(--primary)';
      }, 1500);
      
      this.showToast(`${product.name} added to cart`);
      this.updateCartCount();
    });
    
    // Animate on load
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
    
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
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--primary);
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
      gap: 0.5rem;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 1.25rem;">check_circle</span>
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
}