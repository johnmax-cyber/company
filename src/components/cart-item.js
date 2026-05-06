// Cart item component for Faith & Fashion Nairobi
export class CartItem {
  constructor(item, index) {
    this.item = item;
    this.index = index;
  }

  // Render the cart item HTML
  render() {
    return `
      <div class="cart-item-card">
        <div class="cart-item-image">${this.item.icon}</div>
        <div class="cart-item-details">
          <h3>${escapeHtml(this.item.name)}</h3>
          <p class="price">KSh ${(this.item.price * this.item.qty).toFixed(2)}</p>
          <div class="cart-item-qty">
            <button onclick="cartItemManager.updateQuantity(${this.index}, -1)">-</button>
            <span>${this.item.qty}</span>
            <button onclick="cartItemManager.updateQuantity(${this.index}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="cartItemManager.removeFromCart(${this.index})">Remove</button>
      </div>
    `;
  }
}

// Manager for cart items
export class CartItemManager {
  constructor() {
    this.cart = [];
  }

  // Set cart items
  setCart(cart) {
    this.cart = cart;
  }

  // Render cart items container
  renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h2>Your cart is empty!</h2>
          <p>Looks like you haven't added anything yet. Start shopping to fill up your cart!</p>
          <a href="shop.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      document.getElementById('cartTotal').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="cart-items">
        ${this.cart.map((item, index) => new CartItem(item, index).render()).join('')}
      </div>
    `;

    this.renderCartSummary();
  }

  // Render cart summary
  renderCartSummary() {
    const total = this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
      cartTotalElement.innerHTML = `
        <div class="cart-summary">
          <div class="cart-subtotal">
            <span>Subtotal:</span>
            <span>KSh ${total.toFixed(2)}</span>
          </div>
          <div class="checkout-form" id="checkoutForm">
            <h3 style="margin-bottom:1rem;">Complete Your Order</h3>
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" id="customerName" placeholder="Enter your name" required>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="customerPhone" placeholder="e.g., +254712345678" required>
            </div>
            <div class="checkout-options">
              <button class="checkout-btn mpesa" onclick="cartItemManager.submitOrder('mpesa')">📱 M-Pesa</button>
              <button class="checkout-btn cod" onclick="cartItemManager.submitOrder('cash')">💵 Cash on Delivery</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Update quantity
  updateQuantity(index, delta) {
    const cart = cartService.getCart();
    if (cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      cartService.saveCart(cart);
      this.setCart(cart);
      this.renderCartItems('cartItems');
      updateCartCount();
    }
  }

  // Remove from cart
  removeFromCart(index) {
    const cart = cartService.getCart();
    cart.splice(index, 1);
    cartService.saveCart(cart);
    this.setCart(cart);
    this.renderCartItems('cartItems');
    updateCartCount();
  }

  // Submit order
  async submitOrder(paymentMethod) {
    const name = sanitizeInput(document.getElementById('customerName').value);
    const phone = sanitizeInput(document.getElementById('customerPhone').value);
    
    if (!name || !phone) {
      alert('Please enter your name and phone number.');
      return;
    }
    
    const phoneRegex = /^[+\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number (e.g. +254712345678).');
      return;
    }
    
    const cart = cartService.getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      size: item.size
    }));
    
    try {
      const { success, error } = await orderService.createOrder({
        customer_name: name,
        customer_phone: phone,
        items: orderItems,
        total: total,
        payment_method: paymentMethod,
        status: 'pending'
      });
      
      if (!success) {
        throw new Error(error);
      }
      
      if (paymentMethod === 'mpesa') {
        alert('M-Pesa payment request sent! You will receive an STK push on your phone.');
      } else {
        alert('Order placed! You will pay when the package arrives. Thank you!');
      }
      
      cartService.clearCart();
      this.setCart([]);
      this.renderCartItems('cartItems');
      updateCartCount();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  }
}

// Initialize cart item manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cartItemManager = new CartItemManager();
});

// Helper functions (these would ideally be imported from utils)
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"'`]/g, '').trim().slice(0, 200);
}

function updateCartCount() {
  const cart = cartService.getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = count;
}

// Import order service
import { orderService } from '../services/order-service.js';