// Product card component for Faith & Fashion Nairobi
export class ProductCard {
  constructor(product) {
    this.product = product;
  }

  // Render the product card HTML
  render() {
    const isNew = this.product.tags && this.product.tags.includes('New');
    const isSale = this.product.tags && this.product.tags.includes('Sale');
    
    return `
      <article class="product-card">
        <div class="product-image-wrapper">
          <img src="${this.product.images[0]}" alt="${escapeHtml(this.product.name)}" loading="lazy" width="400" height="500">
          ${isNew ? '<span class="product-badge new-badge">New</span>' : ''}
          ${isSale ? '<span class="product-badge sale-badge">Sale</span>' : ''}
          <div class="product-quickview">
            <a href="product.html?id=${this.product.id}" class="btn btn-primary btn-sm">Quick View</a>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category-tag">${escapeHtml(this.product.subcategory)}</span>
          <h3 class="product-title">${escapeHtml(this.product.name)}</h3>
          <div class="product-price">
            <span class="current-price">${formatCurrency(this.product.price)}</span>
            ${this.product.compareAtPrice ? `<span class="compare-price">${formatCurrency(this.product.compareAtPrice)}</span>` : ''}
          </div>
          <button class="btn btn-primary btn-sm add-to-cart-btn" onclick="productCardManager.addToCartQuick(${this.product.id})">
            Add to Cart
          </button>
        </div>
      </article>
    `;
  }
}

// Manager for product cards
export class ProductCardManager {
  constructor() {
    this.products = [];
  }

  // Set products
  setProducts(products) {
    this.products = products;
  }

  // Render products grid
  renderProductsGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:2rem;">No products found.</p>';
      return;
    }

    container.innerHTML = this.products.map(product => new ProductCard(product).render()).join('');
  }

  // Add to cart quick function (for inline HTML)
  addToCartQuick(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const cart = cartService.getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        qty: 1
      });
    }

    cartService.saveCart(cart);
    updateCartCount();
    showToast(`${product.name} added to cart`);
  }
}

// Initialize product card manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.productCardManager = new ProductCardManager();
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

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function updateCartCount() {
  const cart = cartService.getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = count;
}

function showToast(message) {
  // Remove existing toast
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