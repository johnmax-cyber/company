// Supabase configuration
const SUPABASE_URL = window.__SUPABASE_URL__ || '';
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || '';

// Input sanitization
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"'`]/g, '').trim().slice(0, 200);
}

// XSS protection
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose globally for admin.html
window.supabaseClient = supabaseClient;

// Fallback products (used if Supabase is not configured)
const fallbackProducts = [
  { id: 1, name: 'Classic Dress Shirt', price: 5200, category: 'clothes', subcategory: 'men', description: 'Comfortable and stylish dress shirt.', icon: '👔' },
  { id: 2, name: 'Slim Fit Jeans', price: 6500, category: 'clothes', subcategory: 'men', description: 'Modern slim fit jeans.', icon: '👖' },
  { id: 3, name: 'Wool Blazer', price: 11700, category: 'clothes', subcategory: 'men', description: 'Elegant wool blazer.', icon: '🧥' },
  { id: 4, name: 'Casual Polo', price: 3900, category: 'clothes', subcategory: 'men', description: 'Relaxed cotton polo.', icon: '👕' },
  { id: 5, name: 'Summer Dress', price: 7800, category: 'clothes', subcategory: 'women', description: 'Light summer dress.', icon: '👗' },
  { id: 6, name: 'Blouse Top', price: 4550, category: 'clothes', subcategory: 'women', description: 'Versatile blouse.', icon: '👚' },
  { id: 7, name: 'Maxi Skirt', price: 5850, category: 'clothes', subcategory: 'women', description: 'Flowing maxi skirt.', icon: '👘' },
  { id: 8, name: 'Cardigan', price: 7150, category: 'clothes', subcategory: 'women', description: 'Cozy cardigan.', icon: '🧶' },
  { id: 9, name: 'Kids T-Shirt', price: 2600, category: 'clothes', subcategory: 'children', description: 'Soft cotton t-shirt.', icon: '👕' },
  { id: 10, name: 'Kids Jeans', price: 4550, category: 'clothes', subcategory: 'children', description: 'Durable kids jeans.', icon: '👖' },
  { id: 11, name: 'Kids Hoodie', price: 5200, category: 'clothes', subcategory: 'children', description: 'Warm hoodie.', icon: '🧥' },
  { id: 12, name: 'Kids Sneakers', price: 5850, category: 'clothes', subcategory: 'children', description: 'Comfortable sneakers.', icon: '👟' },
  { id: 13, name: 'Steps to Christ', price: 1950, category: 'books', subcategory: 'devotional', description: 'A devotional guide to Christ.', icon: '📖' },
  { id: 14, name: 'The Great Controversy', price: 1700, category: 'books', subcategory: 'devotional', description: 'The controversy between Christ and Satan.', icon: '📕' },
  { id: 15, name: 'The Desire of Ages', price: 1300, category: 'books', subcategory: 'devotional', description: 'Life of Christ revealed.', icon: '💕' },
  { id: 16, name: 'Ministry of Healing', price: 10400, category: 'books', subcategory: 'study', description: 'Health and healing guide.', icon: '📚' },
  { id: 17, name: 'Patriarchs and Prophets', price: 7800, category: 'books', subcategory: 'study', description: 'Biblical history.', icon: '➕' },
  { id: 18, name: 'Acts of the Apostles', price: 5980, category: 'books', subcategory: 'study', description: 'Early church history.', icon: '🎨' },
  { id: 19, name: 'Bible Stories for Children', price: 1700, category: 'books', subcategory: 'childrens', description: 'Classic Bible stories for kids.', icon: '📖' },
  { id: 20, name: 'My Bible Friends Vol.1', price: 1300, category: 'books', subcategory: 'childrens', description: 'Learn about Bible friends.', icon: '🔤' },
  { id: 21, name: 'Sabbath School Activity Book', price: 1040, category: 'books', subcategory: 'childrens', description: 'Fun activities for Sabbath.', icon: '🖍️' },
  { id: 22, name: 'Gods Amazing Animals', price: 1560, category: 'books', subcategory: 'childrens', description: 'Discover Gods creatures.', icon: '🦁' }
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
  
  if (path === '/' || path.endsWith('/') || path.includes('index.html')) {
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
      <a href="index.html" class="nav-logo">Faith & Fashion Nairobi</a>
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
      </ul>
      <div class="nav-search">
        <input
          type="text"
          id="globalSearch"
          placeholder="Search products..."
          onkeydown="if(event.key==='Enter'){
            window.location.href='shop.html?search='+encodeURIComponent(this.value)
          }"
        >
      </div>
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
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Faith & Fashion Nairobi</h4>
        <p style="color:var(--text-light);font-size:0.9rem;margin-top:0.5rem;">
          Modest clothing & SDA books for the whole family. Delivered in Nairobi.
        </p>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html?category=clothes&subcategory=men">Men's</a></li>
          <li><a href="shop.html?category=clothes&subcategory=women">Women's</a></li>
          <li><a href="shop.html?category=clothes&subcategory=children">Kids</a></li>
          <li><a href="shop.html?category=books">SDA Books</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Info</h4>
        <ul>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="contact.html#delivery">Delivery Policy</a></li>
          <li><a href="contact.html#returns">Returns Policy</a></li>
          <li><a href="contact.html#faq">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:+254712345678">📞 +254 712 345 678</a></li>
          <li><a href="mailto:faithandfashionnairobi@gmail.com">✉️ Email Us</a></li>
          <li><a href="https://wa.me/254712345678" target="_blank">💬 WhatsApp</a></li>
        </ul>
        <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.75rem;">
          Mon–Sat: 9AM–6PM
        </p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Faith & Fashion Nairobi. All rights reserved.</p>
      <p style="font-size:0.8rem;color:var(--text-light);">Pay via M-Pesa • Cash on Delivery • Secure Checkout</p>
    </div>
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
        <span class="product-category ${escapeHtml(product.category)}">${escapeHtml(product.subcategory)}</span>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <p class="product-price">KSh ${parseFloat(product.price).toFixed(2)}</p>
      </div>
    </a>
  `).join('');
  
  const count = document.getElementById('resultCount');
  if (count) {
    const total = productList.length;
    count.textContent = `Showing ${total} product${total !== 1 ? 's' : ''}`;
  }
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
  
  injectProductSchema(product);
  
  const container = document.getElementById('productDetail');
  if (!container) return;
  
  const isClothes = product.category === 'clothes';
  
   container.innerHTML = `
     <div class="product-detail-wrapper">
       <div class="product-detail-large">${escapeHtml(product.icon)}</div>
       <div class="product-detail-content">
         <span class="product-category ${escapeHtml(product.category)}">${escapeHtml(product.subcategory)}</span>
         <h1>${escapeHtml(product.name)}</h1>
         <p class="product-detail-price">KSh ${product.price.toFixed(2)}</p>
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
     <div class="product-delivery-info">
       <div class="delivery-info-item">
         <span class="delivery-info-icon">🚚</span>
         <div>
           <strong>Nairobi Delivery</strong>
           <p>24–48hrs — KSh 200 flat rate</p>
         </div>
       </div>
       <div class="delivery-info-item">
         <span class="delivery-info-icon">↩️</span>
         <div>
           <strong>Easy Returns</strong>
           <p>7-day returns on unworn items</p>
         </div>
       </div>
       <div class="delivery-info-item">
         <span class="delivery-info-icon">📱</span>
         <div>
           <strong>Pay via M-Pesa</strong>
           <p>Safe and instant payment</p>
         </div>
       </div>
       <div class="delivery-info-item">
         <span class="delivery-info-icon">💬</span>
         <div>
           <strong>Need Help?</strong>
           <a href="https://wa.me/254712345678" target="_blank">Chat on WhatsApp</a>
         </div>
       </div>
     </div>
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

function injectProductSchema(product) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || '',
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KES",
      "price": product.price,
      "availability": product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Faith & Fashion Nairobi"
      }
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
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
            <p class="price">KSh ${(item.price * item.qty).toFixed(2)}</p>
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
          <button class="checkout-btn mpesa" onclick="submitOrder('mpesa')">📱 M-Pesa</button>
          <button class="checkout-btn cod" onclick="submitOrder('cash')">💵 Cash on Delivery</button>
        </div>
      </div>
    </div>
  `;
}

async function submitOrder(paymentMethod) {
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
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = count;
  }
}

window.addToCartQuick = function(productId) {
  // Try loading from products.json first
  fetch('/products.json')
    .then(response => response.json())
    .then(data => {
      const products = data.products;
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find(item => item.id === product.id);
      
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images ? product.images[0] : '',
          qty: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      showToast(product.name + ' added to cart');
    })
    .catch(() => {
      // Fallback to products loaded via supabase
      if (typeof allProducts !== 'undefined') {
        const allProds = allProducts;
        const product = allProds.find(p => p.id === productId);
        if (!product) return;
        
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images ? product.images[0] : '',
            qty: 1
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast(product.name + ' added to cart');
      }
    });
};

function showToast(message) {
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
        <div class="stat-value">KSh ${totalRevenue.toFixed(2)}</div>
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
              <td>KSh ${p.price.toFixed(2)}</td>
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

// Floating WhatsApp button - injected on every page
document.addEventListener('DOMContentLoaded', function() {
  const wa = document.createElement('a');
  wa.href = "https://wa.me/254712345678?text=Hello%2C%20I%27m%20interested%20in%20your%20products";
  wa.className = 'whatsapp-float';
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'Chat on WhatsApp');
  wa.textContent = '💬';
  document.body.appendChild(wa);
});