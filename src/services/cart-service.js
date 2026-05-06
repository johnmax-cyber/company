// Service for cart-related operations
import { store } from '../utils/storage.js';

const CART_KEY = 'faith-fashion-cart';

export const cartService = {
  // Get cart from localStorage
  getCart() {
    return store.get(CART_KEY) || [];
  },

  // Save cart to localStorage
  saveCart(cart) {
    return store.set(CART_KEY, cart);
  },

  // Add item to cart
  addItem(item) {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(
      (cartItem) => 
        cartItem.id === item.id && 
        cartItem.size === item.size
    );

    if (existingItemIndex > -1) {
      // Increase quantity if item with same size exists
      cart[existingItemIndex].qty += item.qty;
    } else {
      // Add new item
      cart.push(item);
    }

    return this.saveCart(cart);
  },

  // Update item quantity
  updateItemQuantity(itemId, size, quantity) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(
      (cartItem) => 
        cartItem.id === itemId && 
        cartItem.size === size
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is zero or less
        cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart[itemIndex].qty = quantity;
      }
      
      this.saveCart(cart);
      return true;
    }
    
    return false;
  },

  // Remove item from cart
  removeItem(itemId, size) {
    const cart = this.getCart();
    const initialLength = cart.length;
    
    const filteredCart = cart.filter(
      (cartItem) => 
        !(cartItem.id === itemId && cartItem.size === size)
    );
    
    if (filteredCart.length < initialLength) {
      this.saveCart(filteredCart);
      return true;
    }
    
    return false;
  },

  // Clear cart
  clearCart() {
    return store.remove(CART_KEY);
  },

  // Get cart total
  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  },

  // Get cart item count
  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.qty, 0);
  }
};

export default cartService;