# JavaScript Enhancement Guide for Faith & Fashion Nairobi

## Overview
This guide details the JavaScript enhancements needed to implement modern design elements while maintaining backward compatibility with the existing e-commerce platform.

## Files to Modify

### 1. src/main.js
**Purpose**: Initialize design system and enhanced components

**Changes Needed**:
```javascript
// Add design token initialization at the top
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
    '--shadow-sm': '0 2px 8px rgba(30,58,95,0.08)',
    '--shadow-md': '0 20px 40px rgba(30,58,95,0.08)',
    '--shadow-lg': '0 30px 60px rgba(30,58,95,0.12)'
  };
  
  Object.entries(designTokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Call this before page initialization
initializeDesignSystem();

// Enhanced page detection
const path = window.location.pathname;
let page;

// Determine which enhanced components to use
const useEnhanced = true; // Toggle for testing

if (path.includes('/shop')) {
  page = useEnhanced ? new EnhancedShopPage() : new ShopPage();
} else if (path.includes('/cart')) {
  page = new EnhancedCartPage();
} else if (path.includes('/product')) {
  page = useEnhanced ? new EnhancedProductPage() : new ProductPage();
} else {
  page = new HomePage();
}

// Add global enhancements after page init
await page.init();
addGlobalEnhancements();
```

### 2. src/pages/product.js
**Purpose**: Enhanced product detail page with modern interactions

**Changes Needed**:
```javascript
// Import Toast utility
import { Toast } from '../utils/toast.js';

export class EnhancedProductPage extends ProductPage {
  async init() {
    await super.init();
    this.enhanceProductUI();
  }
  
  enhanceProductUI() {
    this.addQuickView();
    this.enhanceRelatedProducts();
    this.addQuantitySelector();
    this.addGlassEffectToBadges();
  }
  
  addGlassEffectToBadges() {
    const badges = document.querySelectorAll('.product-badges .badge');
    badges.forEach(badge => {
      badge.style.backdropFilter = 'blur(12px)';
      badge.style.background = 'rgba(255, 255, 255, 0.7)';
      badge.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    });
  }
  
  addQuickView() {
    const mainImage = document.querySelector('.product-main-image img');
    if (!mainImage) return;
    
    mainImage.style.cursor = 'zoom-in';
    mainImage.addEventListener('click', () => this.showQuickView());
  }
  
  showQuickView() {
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
      <div style="background: var(--glass-bg); border: 1px solid var(--glass-border);
                  border-radius: var(--radius-lg); padding: 2rem; max-width: 500px;
                  backdrop-filter: blur(12px); position: relative;">
        <button class="close-modal" style="position: absolute; top: 1rem; right: 1rem;
                   background: none; border: none; font-size: 1.5rem; cursor: pointer;
                   color: var(--on-surface);">×</button>
        <img src="${this.product.image_url || ''}" alt="${this.product.name}"
             style="width: 100%; height: auto; border-radius: var(--radius); margin-bottom: 1rem;" />
        <h2 style="font-family: var(--font-family-heading); margin-bottom: 0.5rem;">${this.product.name}</h2>
        <p class="price" style="font-size: 1.5rem; color: var(--primary); font-weight: 700;">
          KSh ${this.product.price.toLocaleString()}
        </p>
        <button class="btn btn-primary btn-lg" id="quickAddBtn" style="width: 100%; margin-top: 1rem;">
          <span class="material-symbols-outlined">add_shopping_cart</span>
          Add to Cart
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#quickAddBtn').addEventListener('click', () => {
      this.handleQuickAdd();
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
  
  handleQuickAdd() {
    const item = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.image_url || '',
      qty: 1
    };
    
    cartService.addItem(item);
    Toast.show(`${this.product.name} added to cart`, 'success');
    this.updateCartCount();
  }
  
  enhanceRelatedProducts() {
    const relatedSection = document.getElementById('relatedSection');
    if (!relatedSection) return;
    
    relatedSection.style.marginTop = '4rem';
    const heading = relatedSection.querySelector('h2');
    if (heading) {
      heading.style.fontFamily = 'var(--font-family-heading)';
    }
  }
  
  addQuantitySelector() {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    // Delegate events for quantity buttons
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('qty-btn')) {
        const qtyContainer = e.target.parentElement;
        const qtySpan = qtyContainer.querySelector('.qty');
        if (!qtySpan) return;
        
        let qty = parseInt(qtySpan.textContent) || 1;
        
        if (e.target.classList.contains('plus')) {
          qty++;
        } else if (e.target.classList.contains('minus') && qty > 1) {
          qty--;
        }
        
        qtySpan.textContent = qty;
        this.updateAddToCartPrice(qty);
      }
    });
  }
  
  updateAddToCartPrice(qty) {
    const priceElement = document.querySelector('.current-price');
    const basePrice = this.product.price;
    if (priceElement && basePrice) {
      priceElement.textContent = `KSh ${(basePrice * qty).toLocaleString()}`;
    }
  }
  
  // Override renderProduct to use enhanced badges
  renderProduct() {
    super.renderProduct();
    this.enhanceBadges();
  }
  
  enhanceBadges() {
    // Replace default badges with glass-styled ones
    document.querySelectorAll('.in-stock-badge, .out-of-stock-badge').forEach(badge => {
      badge.style.cssText = `
        backdrop-filter: blur(12px);
        background: ${badge.classList.contains('in-stock-badge') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
        border: 1px solid ${badge.classList.contains('in-stock-badge') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      `;
    });
  }
}
```

### 3. src/pages/cart.js
**Purpose**: Enhanced cart with modern visual design

**Changes Needed**:
```javascript
export class EnhancedCartPage extends CartPage {
  async init() {
    await super.init();
    this.enhanceCartUI();
  }
  
  enhanceCartUI() {
    this.addGlassEffectToSummary();
    this.enhanceCartItems();
    this.addCheckoutAnimations();
  }
  
  addGlassEffectToSummary() {
    const summary = document.querySelector('.cart-summary');
    if (summary) {
      summary.style.cssText = `
        backdrop-filter: blur(12px);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        transition: all 0.3s ease;
      `;
      
      // Add hover effect
      summary.addEventListener('mouseenter', () => {
        summary.style.boxShadow = 'var(--shadow-lg)';
      });
      summary.addEventListener('mouseleave', () => {
        summary.style.boxShadow = 'var(--shadow-md)';
      });
    }
  }
  
  enhanceCartItems() {
    const cartItems = document.querySelectorAll('.cart-item-card');
    cartItems.forEach(item => {
      item.style.cssText = `
        background: var(--surface);
        border-radius: var(--radius);
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;
        border: 1px solid var(--border);
      `;
      
      // Add hover effect
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-4px)';
        item.style.boxShadow = 'var(--shadow-lg)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0)';
        item.style.boxShadow = 'var(--shadow-sm)';
      });
      
      // Style buttons
      const buttons = item.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.style.borderRadius = 'var(--radius)';
        btn.style.padding = '0.5rem 1rem';
        btn.style.fontWeight = '600';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s ease';
        
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'scale(1)';
        });
      });
    });
  }
  
  addCheckoutAnimations() {
    const checkoutBtn = document.querySelector('.btn-primary');
    if (checkoutBtn) {
      checkoutBtn.style.cssText = `
        background: var(--primary);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: var(--radius);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(2, 36, 72, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        font-size: 1.1rem;
      `;
      
      checkoutBtn.addEventListener('mouseenter', () => {
        checkoutBtn.style.transform = 'translateY(-4px)';
        checkoutBtn.style.boxShadow = '0 20px 40px rgba(2, 36, 72, 0.3)';
      });
      checkoutBtn.addEventListener('mouseleave', () => {
        checkoutBtn.style.transform = 'translateY(0)';
        checkoutBtn.style.boxShadow = '0 10px 30px rgba(2, 36, 72, 0.2)';
      });
    }
  }
  
  // Override renderCart to use enhanced items
  renderCart() {
    super.renderCart();
    this.enhanceCartItems();
    this.addGlassEffectToSummary();
  }
}
```

### 4. src/pages/shop.js
**Purpose**: Enhanced shop page with modern filtering and hover effects

**Changes Needed**:
```javascript
export class EnhancedShopPage extends ShopPage {
  async init() {
    await super.init();
    this.enhanceShopUI();
  }
  
  enhanceShopUI() {
    this.addGlassEffectToFilters();
    this.addEnhancedHoverEffects();
    this.addQuickAddToProductCards();
    this.enhanceSortingUI();
  }
  
  addGlassEffectToFilters() {
    const filterSection = document.querySelector('.product-filters');
    if (filterSection && window.innerWidth > 768) {
      filterSection.style.cssText = `
        backdrop-filter: blur(12px);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius);
        padding: 1rem;
        box-shadow: var(--shadow-sm);
      `;
    }
    
    // Style filter buttons
    const filterLinks = document.querySelectorAll('.filter-link, .filter-btn');
    filterLinks.forEach(link => {
      link.style.cssText = `
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        transition: all 0.2s ease;
        border: 1px solid transparent;
        cursor: pointer;
        font-weight: 500;
      `;
      
      link.addEventListener('mouseenter', () => {
        link.style.background = 'var(--primary)';
        link.style.color = 'white';
        link.style.borderColor = 'var(--primary)';
      });
      link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('active')) {
          link.style.background = 'transparent';
          link.style.color = 'var(--text)';
          link.style.borderColor = 'transparent';
        }
      });
    });
  }
  
  addEnhancedHoverEffects() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // Override render to add enhanced effects
    const originalRender = this.renderProducts;
    this.renderProducts = (products) => {
      originalRender.call(this, products);
      this.applyEnhancedCardEffects();
    };
  }
  
  applyEnhancedCardEffects() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      card.style.cssText = `
        background: var(--surface);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid var(--border);
        position: relative;
      `;
      
      // Add gradient overlay on hover
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = 'var(--shadow-lg)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = 'var(--shadow-sm)';
      });
      
      // Style the add to cart button if present
      const addToCartBtn = card.querySelector('.btn-primary, .add-to-cart');
      if (addToCartBtn) {
        addToCartBtn.style.cssText = `
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          width: 100%;
          justify-content: center;
        `;
      }
    });
  }
  
  addQuickAddToProductCards() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.addEventListener('click', (e) => {
      if (e.target.closest('.quick-add, .add-to-cart')) {
        const card = e.target.closest('.product-card');
        if (card) {
          const productId = card.dataset.productId;
          const product = this.getProductById(parseInt(productId));
          if (product) {
            this.handleQuickAdd(product);
          }
        }
      }
    });
  }
  
  getProductById(id) {
    return this.products ? this.products.find(p => p.id === id) : null;
  }
  
  handleQuickAdd(product) {
    cartService.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      qty: 1
    });
    
    // Show toast notification
    this.showToast(`${product.name} added to cart`);
    this.updateCartCount();
  }
  
  showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
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
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    toast.innerHTML = `
      <span class="material-symbols-outlined">check_circle</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateY(0)', 10);
    setTimeout(() => toast.style.opacity = '1', 50);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  enhanceSortingUI() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.style.cssText = `
        padding: 0.75rem 1rem;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--on-surface);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
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
}
```

### 5. New File: src/utils/toast.js
**Purpose**: Reusable toast notification utility

```javascript
export class Toast {
  static show(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    
    const colors = {
      success: 'var(--primary)',
      error: 'var(--secondary)',
      warning: '#f59e0b',
      info: '#3b82f6'
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
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
  }
}
```

## CSS Additions

Add these classes to your CSS file:

```css
/* Glass Effect */
.glass-effect {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-new {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.badge-out-of-stock {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Quick View Modal */
.quick-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.quick-view-content {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(12px);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Toast Notification */
.toast-notification {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Integration Steps

1. **Update main.js** to initialize design tokens
2. **Create EnhancedProductPage class** in product.js
3. **Create EnhancedCartPage class** in cart.js
4. **Create EnhancedShopPage class** in shop.js
5. **Add Toast utility** in src/utils/toast.js
6. **Update CSS** with new classes
7. **Test all functionality**

## Testing Checklist

- [ ] Cart items display with enhanced styling
- [ ] Add to cart triggers toast notification
- [ ] Quick view modal works on product page
- [ ] Quantity selectors update prices
- [ ] Shop page has hover effects
- [ ] Glass effects render correctly
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] Backward compatibility maintained