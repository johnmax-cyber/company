// Cart page component for Faith & Fashion Nairobi
import { cartService } from '../services/cart-service.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';

export class CartPage {
  constructor() {
    this.cart = [];
  }

  // Initialize the cart page
  async init() {
    // Initialize header and footer
    await header.init();
    footer.init();
    
    // Load cart
    await this.loadCart();
    
    // Render cart
    this.renderCart();
    
    // Enhance UI with modern features
    this.enhanceCartUI();
  }

  // Load cart from service
  async loadCart() {
    try {
      this.cart = cartService.getCart();
    } catch (error) {
      console.error('Error loading cart:', error);
      this.showError('Failed to load cart');
    }
  }

  // Render cart
  renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    if (!this.cart || this.cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some items to get started</p>
          <a href="shop.html" class="btn btn-primary" style="margin-top: 1.5rem;">Start Shopping</a>
        </div>
      `;
      return;
    }
    
    const cartHTML = this.cart.map(item => this.createEnhancedCartItem(item)).join('');
    const summary = this.createEnhancedCartSummary();
    
    cartContainer.innerHTML = `
      <div class="cart-items" style="margin-bottom: 2rem;">
        ${cartHTML}
      </div>
      ${summary}
    `;
    
    // Add event listeners after rendering
    this.addCartEventListeners();
  }
  
  // Create enhanced cart item with modern styling
  createEnhancedCartItem(item) {
    return `
      <div class="cart-item-card enhanced" data-item-id="${item.id}" style="
        background: var(--surface);
        border-radius: var(--radius);
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;
        border: 1px solid var(--border);
        display: flex;
        gap: 1.5rem;
        align-items: center;
      ">
        <div class="cart-item-image" style="
          width: 100px;
          height: 100px;
          border-radius: var(--radius);
          overflow: hidden;
          flex-shrink: 0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${item.image ? `
            <img src="${item.image}" alt="${item.name}" style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
          ` : `
            <span style="font-size: 2rem;">👕</span>
          `}
        </div>
        
        <div class="cart-item-info" style="flex: 1; min-width: 0;">
          <h3 style="
            font-family: 'Playfair Display', serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--on-surface);
            margin-bottom: 0.25rem;
          ">${item.name}</h3>
          <p class="price" style="
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--secondary);
            margin-bottom: 0.5rem;
          ">KSh ${item.price ? item.price.toLocaleString() : '0'}</p>
          ${item.subtotal ? `
            <p style="font-size: 0.875rem; color: var(--text-light);">
              Total: KSh ${item.subtotal.toLocaleString()}
            </p>
          ` : ''}
        </div>
        
        <div class="cart-item-actions" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        ">
          <div class="cart-item-qty" style="
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--background);
            padding: 0.5rem;
            border-radius: var(--radius);
          ">
            <button class="qty-btn-minus" data-id="${item.id}" style="
              width: 32px;
              height: 32px;
              border-radius: 0.5rem;
              border: 1px solid var(--border);
              background: white;
              cursor: pointer;
              font-weight: 600;
              font-size: 1.25rem;
              color: var(--primary);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
            " aria-label="Decrease quantity">-</button>
            <span class="qty" style="
              min-width: 32px;
              text-align: center;
              font-weight: 600;
              font-size: 1rem;
            ">${item.qty}</span>
            <button class="qty-btn-plus" data-id="${item.id}" style="
              width: 32px;
              height: 32px;
              border-radius: 0.5rem;
              border: 1px solid var(--border);
              background: white;
              cursor: pointer;
              font-weight: 600;
              font-size: 1.25rem;
              color: var(--primary);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
            " aria-label="Increase quantity">+</button>
          </div>
          
          <button class="remove-btn" data-id="${item.id}" style="
            background: var(--secondary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.2s ease;
          " aria-label="Remove item">
            <span class="material-symbols-outlined" style="font-size: 1rem; vertical-align: middle; margin-right: 0.25rem;">delete</span>
            Remove
          </button>
        </div>
      </div>
    `;
  }
  
  // Create enhanced cart summary with glass effect
  createEnhancedCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal >= 5000 ? 0 : 500;
    const total = subtotal + shipping;
    const itemCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
    
    return `
      <div class="cart-summary glass-effect" style="
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius);
        padding: 2rem;
        box-shadow: var(--shadow-md);
        transition: all 0.3s ease;
      ">
        <div style="margin-bottom: 1.5rem;">
          <h2 style="
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
          ">Order Summary</h2>
          <p style="color: var(--text-light); font-size: 0.875rem;">${itemCount} item${itemCount !== 1 ? 's' : ''} in cart</p>
        </div>
        
        <div class="summary-details" style="margin-bottom: 1.5rem;">
          <div class="summary-row" style="
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            color: var(--on-surface);
          ">
            <span>Subtotal (${itemCount} items)</span>
            <span style="font-weight: 600;">KSh ${subtotal.toLocaleString()}</span>
          </div>
          <div class="summary-row" style="
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            color: var(--on-surface);
          ">
            <span>Delivery Fee</span>
            <span style="font-weight: 600; color: ${shipping === 0 ? 'var(--primary)' : 'inherit'};">
              ${shipping === 0 ? 'FREE' : 'KSh ' + shipping.toLocaleString()}
            </span>
          </div>
          ${subtotal < 5000 ? `
            <div style="
              font-size: 0.75rem;
              color: var(--primary);
              margin-top: 0.5rem;
              padding: 0.5rem;
              background: rgba(30, 58, 95, 0.05);
              border-radius: var(--radius);
            ">
              Spend KSh ${(5000 - subtotal).toLocaleString()} more for free delivery
            </div>
          ` : ''}
          <div class="summary-row summary-total" style="
            display: flex;
            justify-content: space-between;
            padding: 1rem 0;
            border-top: 2px solid var(--border);
            margin-top: 1rem;
          ">
            <span style="font-weight: 700; font-size: 1.1rem;">Total</span>
            <span style="font-weight: 700; font-size: 1.25rem; color: var(--secondary);">
              KSh ${total.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div class="checkout-actions" style="display: flex; flex-direction: column; gap: 1rem;">
          <button class="btn btn-primary btn-lg checkout-btn" style="
            background: var(--primary);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: var(--radius);
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            box-shadow: 0 10px 30px rgba(2, 36, 72, 0.2);
          " id="checkoutBtn">
            <span class="material-symbols-outlined">lock</span>
            Secure Checkout
          </button>
          
          <div style="text-align: center; color: var(--text-light); font-size: 0.75rem;
            padding-top: 1rem; border-top: 1px solid var(--border);">
            <span class="material-symbols-outlined" style="font-size: 0.875rem;">shield</span>
            Your transaction is encrypted and secure
          </div>
        </div>
      </div>
    `;
  }
  
  // Add event listeners to cart items
  addCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.qty-btn-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.qty-btn-minus').dataset.id);
        this.updateQuantity(itemId, -1);
      });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.qty-btn-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.qty-btn-plus').dataset.id);
        this.updateQuantity(itemId, 1);
      });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.remove-btn').dataset.id);
        this.removeItem(itemId);
      });
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }
    
    // Add hover effects to cart items
    document.querySelectorAll('.cart-item-card').forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      });
      item.addEventListener('mouseleave', (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      });
    });
  }
  
  // Update item quantity
  async updateQuantity(itemId, change) {
    const item = this.cart.find(i => i.id === itemId);
    if (!item) return;
    
    const newQty = item.qty + change;
    if (newQty < 1) return;
    
    await cartService.updateQuantity(itemId, newQty);
    await this.loadCart();
    this.renderCart();
    this.enhanceCartUI();
    this.updateCartCount();
  }
  
  // Remove item from cart
  async removeItem(itemId) {
    // Add confirmation animation
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
      itemElement.style.transition = 'all 0.3s ease';
      itemElement.style.opacity = '0';
      itemElement.style.transform = 'translateX(-20px)';
      
      setTimeout(async () => {
        await cartService.removeItem(itemId);
        await this.loadCart();
        this.renderCart();
        this.enhanceCartUI();
        this.updateCartCount();
        this.showToast('Item removed from cart');
      }, 300);
    } else {
      await cartService.removeItem(itemId);
      await this.loadCart();
      this.renderCart();
      this.enhanceCartUI();
      this.updateCartCount();
      this.showToast('Item removed from cart');
    }
  }
  
  // Handle checkout
  handleCheckout() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty!', 'warning');
      return;
    }
    
    // Animate button
    const btn = document.getElementById('checkoutBtn');
    if (btn) {
      btn.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        Processing...
      `;
      btn.disabled = true;
      
      // Simulate processing
      setTimeout(() => {
        this.showToast('Order placed successfully!', 'success');
        cartService.clearCart();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }, 1500);
    }
  }
  
  // Update cart count in header
  updateCartCount() {
    const cart = cartService.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
  }
  
  // Enhance cart UI
  enhanceCartUI() {
    // Add glass effect on hover
    const summary = document.querySelector('.cart-summary');
    if (summary) {
      summary.addEventListener('mouseenter', () => {
        summary.style.boxShadow = 'var(--shadow-lg)';
      });
      summary.addEventListener('mouseleave', () => {
        summary.style.boxShadow = 'var(--shadow-md)';
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
  
  // Show error message
  showError(message) {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
      cartContainer.innerHTML = `
        <div class="error-message" style="text-align:center;padding:3rem;">
          <h2>${message}</h2>
          <a href="shop.html" class="btn btn-primary" style="margin-top:1rem;">Browse Products</a>
        </div>
      `;
    }
  }
}