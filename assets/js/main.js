// Supabase configuration
const SUPABASE_URL = 'https://lldckqllbljogqbidbpp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZGNrcWxsYmxqb2dxYmlkYnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTM1NTYsImV4cCI6MjA2MjE4OTU1Nn0.sb_publishable_zcqkR4_8oHbjjZbhMDpl3A_uMMg6UYo';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallback products (used if Supabase is not configured)
const fallbackProducts = [
  { id: 1, name: 'Classic Dress Shirt', price: 39.99, category: 'clothes', subcategory: 'men', description: 'Comfortable and stylish dress shirt.', icon: '👔' },
  { id: 2, name: 'Slim Fit Jeans', price: 49.99, category: 'clothes', subcategory: 'men', description: 'Modern slim fit jeans.', icon: '👖' },
  { id: 3, name: 'Wool Blazer', price: 89.99, category: 'clothes', subcategory: 'men', description: 'Elegant wool blazer.', icon: '🧥' },
  { id: 4, name: 'Casual Polo', price: 29.99, category: 'clothes', subcategory: 'men', description: 'Relaxed cotton polo.', icon: '👕' },
  { id: 5, name: 'Summer Dress', price: 59.99, category: 'clothes', subcategory: 'women', description: 'Light summer dress.', icon: '👗' },
  { id: 6, name: 'Blouse Top', price: 34.99, category: 'clothes', subcategory: 'women', description: 'Versatile blouse.', icon: '👚' },
  { id: 7, name: 'Maxi Skirt', price: 44.99, category: 'clothes', subcategory: 'women', description: 'Flowing maxi skirt.', icon: '👘' },
  { id: 8, name: 'Cardigan', price: 54.99, category: 'clothes', subcategory: 'women', description: 'Cozy cardigan.', icon: '🧶' },
  { id: 9, name: 'Kids T-Shirt', price: 19.99, category: 'clothes', subcategory: 'children', description: 'Soft cotton t-shirt.', icon: '👕' },
  { id: 10, name: 'Kids Jeans', price: 34.99, category: 'clothes', subcategory: 'children', description: 'Durable kids jeans.', icon: '👖' },
  { id: 11, name: 'Kids Hoodie', price: 39.99, category: 'clothes', subcategory: 'children', description: 'Warm hoodie.', icon: '🧥' },
  { id: 12, name: 'Kids Sneakers', price: 44.99, category: 'clothes', subcategory: 'children', description: 'Comfortable sneakers.', icon: '👟' },
  { id: 13, name: 'The Great Adventure', price: 14.99, category: 'books', subcategory: 'fiction', description: 'An exciting adventure.', icon: '📖' },
  { id: 14, name: 'Mystery at Midnight', price: 12.99, category: 'books', subcategory: 'fiction', description: 'A thrilling mystery.', icon: '📕' },
  { id: 15, name: 'Love in Paris', price: 9.99, category: 'books', subcategory: 'fiction', description: 'A romantic story.', icon: '💕' },
  { id: 16, name: 'Science Textbook', price: 79.99, category: 'books', subcategory: 'textbooks', description: 'Science reference.', icon: '📚' },
  { id: 17, name: 'Math Fundamentals', price: 59.99, category: 'books', subcategory: 'textbooks', description: 'Math guide.', icon: '➕' },
  { id: 18, name: 'History of Art', price: 45.99, category: 'books', subcategory: 'textbooks', description: 'Art history.', icon: '🎨' },
  { id: 19, name: 'Bedtime Stories', price: 12.99, category: 'books', subcategory: 'childrens', description: 'Bedtime stories.', icon: '📖' },
  { id: 20, name: 'ABC Learning', price: 9.99, category: 'books', subcategory: 'childrens', description: 'Learn alphabet.', icon: '🔤' },
  { id: 21, name: 'Coloring Fun', price: 7.99, category: 'books', subcategory: 'childrens', description: 'Coloring book.', icon: '🖍️' },
  { id: 22, name: 'Animal Kingdom', price: 11.99, category: 'books', subcategory: 'childrens', description: 'Learn about animals.', icon: '🦁' }
];

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedCategory = 'all';
let selectedSubcategory = 'all';
let selectedSize = null;
let searchQuery = '';

// Loading spinner HTML
function showLoading() {
  return '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
}

// Error message HTML
function showError(message) {
  return `<div class="error-message"><p>⚠️ ${message}</p></div>`;
}

// Fetch products from Supabase
async function fetchProducts(showLoadingInGrid = true) {
  const grid = document.getElementById('productsGrid');
  if (grid && showLoadingInGrid) {
    grid.innerHTML = showLoading();
  }
  
  if (SUPABASE_URL.includes('YOUR_SUPABASE') || SUPABASE_URL.includes('lldckqllbljogqbidbpp')) {
    products = fallbackProducts;
    if (grid) grid.innerHTML = '';
    return products;
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('in_stock', true);
    
    if (error) {
      console.error('Error fetching products:', error);
      if (grid) grid.innerHTML = showError('Failed to load products. Please try again.');
      products = fallbackProducts;
    } else {
      products = data || fallbackProducts;
    }
  } catch (e) {
    console.error('Network error:', e);
    if (grid) grid.innerHTML = showError('Network error. Please check your connection.');
    products = fallbackProducts;
  }
  return products;
}

async function init() {
  renderNavbar();
  renderFooter();
  
  const path = window.location.pathname;
  
  // Fetch products from Supabase
  await fetchProducts();
  
  if (path.includes('shop.html') || path === '/' || path.endsWith('/') || path.includes('index.html')) {
    renderProducts(products);
    setupFilters();
    setupSearch();
  }
  if (path.includes('product.html')) {
    loadProductDetail();
  }
  if (path.includes('cart.html')) {
    renderCart();
  }
  if (path.includes('admin.html')) {
    renderAdmin();
  }
  setupMobileMenu();
  updateCartCount();
}

function renderNavbar() {
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const navbarHTML = `
    <nav class="navbar">
      <a href="index.html" class="nav-logo">Company</a>
      <div class="hamburger" onclick="toggleMenu()" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul class="nav-menu">
        <li><a href="index.html" class="nav-link">Home</a></li>
        <li><a href="shop.html" class="nav-link">Shop</a></li>
        <li><a href="cart.html" class="nav-link">Cart</a></li>
        <li><a href="contact.html" class="nav-link">Contact</a></li>
        <li><a href="admin.html" class="nav-link">Admin</a></li>
      </ul>
      <div class="nav-actions">
        <a href="cart.html" class="nav-cart" aria-label="Shopping cart">
          <span class="cart-icon">🛒</span>
          <span class="cart-count" id="cartCount">${cartItemCount}</span>
        </a>
      </div>
    </nav>
  `;
  
  const header = document.getElementById('header');
  if (header) header.innerHTML = navbarHTML;
  
  // Setup mobile menu toggle after navbar is rendered
  setupMobileMenu();
}

function renderFooter() {
  const footerHTML = `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Company</h4>
          <p>Your friendly shop for clothes and books for the whole family.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="shop.html">Shop</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Categories</h4>
          <ul class="footer-links">
            <li><a href="shop.html">Clothes</a></li>
            <li><a href="shop.html">Books</a></li>
            <li><a href="shop.html">Kids</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li>📍 123 Shop Street</li>
            <li>📞 (555) 123-4567</li>
            <li>✉️ hello@company.com</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Company. All rights reserved.</p>
      </div>
    </footer>
  `;
  
  const footer = document.getElementById('footer');
  if (footer) footer.innerHTML = footerHTML;
}

function setupMobileMenu() {
  window.toggleMenu = function() {
    const menu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
  };
}

function filterProducts() {
  let filtered = [...products];
  
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }
  
  if (selectedSubcategory !== 'all') {
    filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
  }
  
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
  }
  
  renderProducts(filtered);
}

function renderProducts(productList) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  if (productList.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:2rem;">No products found.</p>';
    return;
  }
  
  grid.innerHTML = productList.map(product => `
    <a href="product.html?id=${product.id}" class="product-card">
      <div class="product-image">${product.icon}</div>
      <div class="product-info">
        <span class="product-category ${product.category}">${product.subcategory}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
      </div>
    </a>
  `).join('');
}

function setupFilters() {
  window.filterByCategory = function(category, subcategory) {
    selectedCategory = category;
    selectedSubcategory = subcategory || 'all';
    
    document.querySelectorAll('.filter-link').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === category && btn.dataset.subcategory === (subcategory || '')) {
        btn.classList.add('active');
      }
    });
    
    filterProducts();
  };
  
  window.sortBy = function(sort) {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }
    
    if (sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    renderProducts(filtered);
  };
}

function setupSearch() {
  window.handleSearch = function(query) {
    searchQuery = query;
    filterProducts();
  };
}

function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id')) || 1;
  const product = products.find(p => p.id === id) || products[0];
  
  const container = document.getElementById('productDetail');
  if (!container) return;
  
  const isClothes = product.category === 'clothes';
  
  container.innerHTML = `
    <div class="product-detail-wrapper">
      <div class="product-detail-large">${product.icon}</div>
      <div class="product-detail-content">
        <span class="product-category ${product.category}">${product.subcategory}</span>
        <h1>${product.name}</h1>
        <p class="product-detail-price">$${product.price.toFixed(2)}</p>
        <p class="product-detail-description">
          ${isClothes 
            ? 'Comfortable and stylish clothing perfect for everyday wear. Made with quality materials for lasting comfort and ease.' 
            : 'An engaging book filled with exciting stories and adventures. Perfect for young readers and the whole family to enjoy together.'}
        </p>
        ${isClothes ? `
          <div class="product-detail-options">
            <label>Select Size:</label>
            <div class="size-selector">
              <button class="size-btn" onclick="selectSize('XS', this)">XS</button>
              <button class="size-btn" onclick="selectSize('S', this)">S</button>
              <button class="size-btn" onclick="selectSize('M', this)">M</button>
              <button class="size-btn" onclick="selectSize('L', this)">L</button>
              <button class="size-btn" onclick="selectSize('XL', this)">XL</button>
            </div>
          </div>
        ` : ''}
        <div class="quantity-selector">
          <label>Quantity:</label>
          <div>
            <button onclick="changeQty(-1)">-</button>
            <span id="qtyDisplay">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
        </div>
        <button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `;
  
  window.selectSize = function(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };
  
  window.changeQty = function(delta) {
    const display = document.getElementById('qtyDisplay');
    let qty = parseInt(display.textContent) + delta;
    if (qty < 1) qty = 1;
    display.textContent = qty;
  };
  
  window.addToCart = function(productId) {
    const prod = products.find(p => p.id === productId);
    const qty = parseInt(document.getElementById('qtyDisplay')?.textContent) || 1;
    
    const existing = cart.find(item => item.id === productId && item.size === selectedSize);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: qty, icon: prod.icon, size: selectedSize, category: prod.category, subcategory: prod.subcategory });
    }
    
    saveCart();
    alert('Added to cart!');
    updateCartCount();
  };
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  
  if (cart.length === 0) {
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
      ${cart.map((item, index) => `
        <div class="cart-item-card">
          <div class="cart-item-image">${item.icon}</div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p class="price">$${(item.price * item.qty).toFixed(2)}</p>
            <div class="cart-item-qty">
              <button onclick="updateQuantity(${index}, -1)">-</button>
              <span>${item.qty}</span>
              <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
        </div>
      `).join('')}
    </div>
  `;
  
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cartTotal').innerHTML = `
    <div class="cart-summary">
      <div class="cart-subtotal">
        <span>Subtotal:</span>
        <span>$${total.toFixed(2)}</span>
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
          <button class="checkout-btn mpesa" onclick="submitOrder('mpesa')">📱 M-Pesa</button>
          <button class="checkout-btn cod" onclick="submitOrder('cash')">💵 Cash on Delivery</button>
        </div>
      </div>
    </div>
  `;
}

async function submitOrder(paymentMethod) {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  
  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    size: item.size
  }));
  
  if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL') {
    // Demo mode - just clear cart
    alert('Order placed! Thank you for shopping with us!');
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    return;
  }
  
  const { data, error } = await supabaseClient
    .from('orders')
    .insert([{
      customer_name: name,
      customer_phone: phone,
      items: orderItems,
      total: total,
      payment_method: paymentMethod,
      status: 'pending'
    }]);
  
  if (error) {
    console.error('Error placing order:', error);
    alert('Error placing order. Please try again.');
    return;
  }
  
  if (paymentMethod === 'mpesa') {
    alert('M-Pesa payment request sent! You will receive an STK push on your phone.');
  } else {
    alert('Order placed! You will pay when the package arrives. Thank you!');
  }
  
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
}

function updateQuantity(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = count;
  }
}

function renderAdmin() {
  const totalOrders = 156;
  const totalProducts = products.length;
  const totalCustomers = 89;
  const totalRevenue = cart.reduce((sum, item) => sum + item.price * item.qty, 0) + 2450.67;
  
  const statsContainer = document.getElementById('adminStats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${totalOrders}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalProducts}</div>
        <div class="stat-label">Products</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalCustomers}</div>
        <div class="stat-label">Customers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">$${totalRevenue.toFixed(2)}</div>
        <div class="stat-label">Revenue</div>
      </div>
    `;
  }
  
  const productsContainer = document.getElementById('adminProducts');
  if (productsContainer) {
    productsContainer.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.id}</td>
              <td>${p.icon} ${p.name}</td>
              <td>${p.category} - ${p.subcategory}</td>
              <td>$${p.price.toFixed(2)}</td>
              <td>
                <button class="btn btn-outline" style="padding:0.25rem 0.5rem;font-size:0.875rem;">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

document.addEventListener('DOMContentLoaded', init);