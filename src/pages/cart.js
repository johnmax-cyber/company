// Cart page component for Faith & Fashion Nairobi
import { cartService } from '../services/cart-service.js';
import { orderService } from '../services/order-service.js';
import { store } from '../utils/storage.js';
import { formatCurrency } from '../utils/storage.js';
import { header } from '../components/header.js';
import { footer } from '../components/footer.js';

export class CartPage {
  constructor() {
    this.cartItems = [];
  }

  // Initialize the cart page
  async init() {
    // Initialize header and footer
    await header.init();
    footer.init();
    
    // Load and render cart
    this.renderCart();
    
    // Setup form handlers
    this.setupHandlers();
  }

  // Render cart items
  renderCart() {
    this.cartItems = cartService.getCart();
    
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    if (this.cartItems.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <div style="text-align:center;padding:3rem;">
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a href="shop.html" class="btn btn-primary" style="margin-top:1rem;">Continue Shopping</a>
          </div>
        </div>
      `;
      return;
    }
    
    // Calculate totals
    const subtotal = this.calculateSubtotal();
    const shipping = 150; // Flat rate shipping
    const total = subtotal + shipping;
    
    // Render cart items
    cartContainer.innerHTML = `
      <div class="cart-content">
        <div class="cart-items-section">
          <div id="cartItems" class="cart-items">
            ${this.cartItems.map((item, index) => this.createCartItemHtml(item, index)).join('')}
          </div>
        </div>
        
        <div class="cart-summary-section">
          <div class="card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span id="subtotal">${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span id="shipping">${formatCurrency(shipping)}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total</span>
              <span id="total">${formatCurrency(total)}</span>
            </div>
            
            <div class="checkout-form">
              <h4>Checkout Information</h4>
              <form id="checkoutForm">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="customerName" required placeholder="Enter your full name">
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" id="customerPhone" required placeholder="Enter your phone number">
                </div>
                <div class="form-group">
                  <label>Payment Method</label>
                  <select id="paymentMethod" required>
                    <option value="">Select payment method</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash on Delivery</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;">Place Order</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Create cart item HTML
  createCartItemHtml(item, index) {
    return `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : `<span style="font-size:2rem;">🛍️</span>`}
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-price">${formatCurrency(item.price)}</p>
          <div class="cart-item-quantity">
            <button type="button" class="qty-btn minus" data-index="${index}" data-change="-1">-</button>
            <input type="number" class="qty-input" value="${item.qty}" min="1" data-index="${index}">
            <button type="button" class="qty-btn plus" data-index="${index}" data-change="1">+</button>
          </div>
          <button type="button" class="remove-item" data-index="${index}">Remove</button>
        </div>
        <div class="cart-item-total">
          <strong>${formatCurrency(item.price * item.qty)}</strong>
        </div>
      </div>
    `;
  }

  // Setup event handlers
  setupHandlers() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;
    
    // Event delegation for cart items
    cartContainer.addEventListener('click', (e) => {
      const target = e.target;
      
      // Quantity buttons
      if (target.classList.contains('qty-btn')) {
        const index = parseInt(target.dataset.index);
        const change = parseInt(target.dataset.change);
        this.updateQuantity(index, change);
      }
      
      // Remove button
      if (target.classList.contains('remove-item')) {
        const index = parseInt(target.dataset.index);
        this.removeItem(index);
      }
    });
    
    // Quantity input change
    cartContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('qty-input')) {
        const index = parseInt(e.target.dataset.index);
        const newQty = parseInt(e.target.value) || 1;
        this.setQuantity(index, newQty);
      }
    });
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
    }
  }

  // Update item quantity
  updateQuantity(index, change) {
    const item = this.cartItems[index];
    if (!item) return;
    
    const newQty = item.qty + change;
    this.setQuantity(index, newQty);
  }

  // Set item quantity
  setQuantity(index, newQty) {
    const item = this.cartItems[index];
    if (!item) return;
    
    if (newQty <= 0) {
      this.removeItem(index);
      return;
    }
    
    cartService.updateItemQuantity(item.id, item.size || null, newQty);
    this.renderCart();
    this.updateCartCount();
  }

  // Remove item from cart
  removeItem(index) {
    const item = this.cartItems[index];
    if (!item) return;
    
    cartService.removeItem(item.id, item.size || null);
    this.renderCart();
    this.updateCartCount();
    
    this.showToast(`${item.name} removed from cart`);
  }

  // Calculate subtotal
  calculateSubtotal() {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  // Handle checkout
  async handleCheckout(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!customerName || !customerPhone || !paymentMethod) {
      this.showToast('Please fill in all fields');
      return;
    }
    
    // Calculate total
    const subtotal = this.calculateSubtotal();
    const shipping = 150;
    const total = subtotal + shipping;
    
    // Create order
    const orderData = {
      customer_name: customerName,
      phone: customerPhone,
      payment_method: paymentMethod,
      total: total,
      shipping: shipping,
      status: 'pending',
      items: this.cartItems
    };
    
    const result = await orderService.createOrder(orderData);
    
    if (result.success) {
      // Clear cart
      cartService.clearCart();
      this.updateCartCount();
      
      // Show success message
      this.showToast('Order placed successfully!');
      
      // Display confirmation
      const cartContainer = document.getElementById('cartContainer');
      cartContainer.innerHTML = `
        <div class="order-confirmation">
          <div style="text-align:center;padding:3rem;">
            <h2 style="color:var(--primary);">✓ Order Confirmed!</h2>
            <p style="font-size:1.2rem;margin:1rem 0;">Thank you for your purchase, ${customerName}!</p>
            <p>Order ID: ${result.data?.[0]?.id || 'N/A'}</p>
            <p>Total: ${formatCurrency(total)}</p>
            <p style="margin:1.5rem 0;color:#666;">We'll process your order shortly and contact you at ${customerPhone}.</p>
            <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>
      `;
    } else {
      this.showToast('Failed to place order. Please try again.');
      console.error('Order creation error:', result.error);
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
