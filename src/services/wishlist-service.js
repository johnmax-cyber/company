// Wishlist Service for Faith & Fashion Nairobi
// Manages saved products with localStorage persistence

export const wishlistService = {
  // Get all wishlisted products
  getWishlist() {
    try {
      const wishlist = localStorage.getItem('faith-fashion-wishlist');
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  },

  // Add product to wishlist
  addToWishlist(productId) {
    try {
      const wishlist = this.getWishlist();
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('faith-fashion-wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId } }));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  },

  // Remove product from wishlist
  removeFromWishlist(productId) {
    try {
      const wishlist = this.getWishlist();
      const filtered = wishlist.filter(id => id !== productId);
      localStorage.setItem('faith-fashion-wishlist', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId } }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  },

  // Toggle wishlist for a product
  toggleWishlist(productId) {
    if (this.isWishlisted(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  },

  // Check if product is wishlisted
  isWishlisted(productId) {
    return this.getWishlist().includes(productId);
  },

  // Get count of wishlisted items
  getWishlistCount() {
    return this.getWishlist().length;
  },

  // Clear entire wishlist
  clearWishlist() {
    try {
      localStorage.removeItem('faith-fashion-wishlist');
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId: null } }));
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  window.wishlistService = wishlistService;
}
