# SITEMAP & INFORMATION ARCHITECTURE

## Multi-Platform E-commerce Application - Faith & Fashion Nairobi

**Version:** 2.0  
**Platform:** Web Application (Responsive)  
**Architecture:** Single Page Application with Vanilla JavaScript  
**Backend:** Supabase (PostgreSQL)  
**Deployment:** Vercel  

---

## 1. GLOBAL SITE STRUCTURE

### 1.1 Top-Level Navigation Hierarchy

```
├── Public Facing (No Authentication Required)
│   ├── Homepage (/)
│   │   └── index.html
│   ├── Shop Page (/shop)
│   │   └── shop.html
│   ├── Product Detail Page (/product/:id)
│   │   └── product.html
│   ├── Cart & Checkout (/checkout)
│   │   ├── cart_checkout.html (mobile-first, default)
│   │   └── cart_checkout_desktop.html (large-screen optimized)
│   ├── Track Order (/track)
│   │   └── track-order.html
│   └── Contact Support (/contact)
│       └── contact.html
│
└── Administrative (Protected Route)
    └── Admin Dashboard (/admin)
        └── admin.html
```

---

## 2. DETAILED PAGE ARCHITECTURE

### 2.1 Homepage (`/` - `index.html`)

**Purpose:** Primary conversion entry point

**Content Modules:**
- Hero Banner (Featured promotion / seasonal campaign)
- Featured Collection Carousel
- New Arrivals Grid (8-12 products)
- Best Sellers Section
- Category Navigation Cards (Men, Women, Kids, Books)
- Newsletter Signup CTA
- Footer with site links

**User Actions:**
- Browse featured products
- Navigate to shop page
- Search products
- View product details
- Add to cart (via quick view or product page)

**Technical:** `src/pages/home.js` - Handles initial data fetch and hero configuration

---

### 2.2 Shop Page (`/shop` - `shop.html`)

**Purpose:** Dynamic product discovery and filtering hub

**Features:**
- Grid layout (3 columns desktop, 2 columns tablet, 1 column mobile)
- Product cards with:
  - Image thumbnail (lazy-loaded)
  - Product name
  - Price (with discount if applicable)
  - Rating indicator
  - "Quick View" button
- Filtering Sidebar:
  - Category (Men's, Women's, Kids, Books)
  - Subcategory (when applicable)
  - Price Range (min/max slider)
  - Size (S, M, L, XL, XXL)
  - Color (color swatches)
  - Availability (In Stock)
  - Rating (4+ stars, 3+ stars)
- Sorting Options:
  - Featured (default)
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Best Selling
  - Highest Rated
- Pagination (20 products per page)
- Search integration (query params)

**State Management:** URL-based filtering (`?category=men&price_max=5000&sort=price_asc`)

**Technical:** `src/pages/shop.js` - Fetches from `product-service.js` with filter/sort logic

---

### 2.3 Product Detail Page (`/product/:id` - `product.html`)

**Purpose:** Immersive product presentation with conversion optimization

**Sections:**

**A. Media Gallery**
- Main product image (zoom on hover)
- Thumbnail carousel (3-5 additional angles)
- Optional: 360° view or video embed

**B. Product Information**
- Product name (H1)
- Price (current + original if discounted)
- Rating & review count
- SKU / product ID
- Short description
- Key features bullet list

**C. Attribute Selection**
- Size selector (buttons: S, M, L, XL, XXL) - with stock indicator
- Color selector (color swatches) - with stock indicator
- Quantity selector (min 1, max 10)
- "Add to Cart" primary CTA button
- "Buy Now" secondary CTA (direct checkout)
- Wishlist/Favorites toggle

**D. Detailed Information Tabs**
- Description (long form with HTML markup)
- Specifications (size chart, material, care instructions)
- Shipping & Returns policy
- Customer Reviews (paginated)

**E. Related Products**
- "You may also like" (4-6 products from same category/subcategory)
- "Frequently bought together" (cross-sells)

**Technical:** `src/pages/product.js` - Handles image gallery, attribute selection state, and cart integration

---

### 2.4 Cart & Checkout System (Bifurcated Implementation)

#### 2.4.1 Mobile-First Version (`/checkout` - `cart_checkout.html`)

**Target Viewport:** 320px - 767px (Mobile portrait/landscape)

**Layout Strategy:**
- Single column vertical flow
- Sticky cart summary at bottom (collapsible)
- Accordion-style section expansion
- Touch-optimized form inputs (min 44px tap targets)

**Sections (in order):**
1. **Progress Indicator** (3 steps: Cart → Shipping → Payment)
2. **Cart Items List** (scrollable, with +/-, delete)
3. **Order Summary** (subtotal, shipping, taxes, total)
4. **Shipping Information Form**
   - Full name
   - Phone number (required for M-Pesa)
   - Email
   - Delivery address (street, city, estate)
   - Delivery instructions (optional)
5. **Payment Method Selection**
   - M-Pesa (highlighted, default)
   - Cash on Delivery
   - If M-Pesa: Show M-Pesa number (for manual payment)
6. **Place Order Button** (prominent, fixed to bottom on scroll)

**Technical:** `src/pages/cart-mobile.js` - Optimized touch interactions, minimal DOM updates

---

#### 2.4.2 Desktop Optimized Version (`/checkout` - `cart_checkout_desktop.html`)

**Target Viewport:** 768px+ (Tablet/Desktop)

**Layout Strategy:**
- Two-column layout (75% left, 25% right sticky)
- Side-by-side cart and summary
- Desktop-optimized form (clear labels, floating labels optional)

**Sections:**
1. **Progress Indicator** (horizontal steps)
2. **Two-Column Grid**
   - **Left Column (Main Content)**
     - Cart Items (with expandable details)
     - Shipping Form (multi-column for address)
     - Payment Radio Selection
   - **Right Column (Sticky Sidebar)**
     - Order Summary (fixed on scroll)
     - Promo Code Input
     - Trust Badges (Secure checkout logos)
3. **Place Order Button** (large, centered, high contrast)

**Technical:** `src/pages/cart-desktop.js` - Enhanced hover states, keyboard navigation

---

### 2.5 Post-Purchase Loop

#### 2.5.1 Order Confirmation Page (`/order-confirmation/:orderId`)

**Content:**
- Success message ("Thank you for your order!")
- Order number (display and copy to clipboard)
- Order summary (items, total, shipping address)
- Estimated delivery date
- Next steps (tracking info will be sent via email/SMS)
- "Continue Shopping" CTA
- "Track Your Order" button

**Technical:** `src/pages/order-confirmation.js`

---

#### 2.5.2 Track Order Page (`/track` - `track-order.html`)

**Purpose:** Post-purchase order status tracking

**Features:**
- Order ID input field
- Phone number verification (for SMS tracking updates)
- Order status timeline (Processing → Confirmed → Shipped → Delivered)
- Estimated delivery date
- Support contact if order is delayed

**Technical:** `src/pages/track-order.js` - Calls `order-service.js` fetchOrderStatus()

---

### 2.6 Contact Support Page (`/contact` - `contact.html`)

**Purpose:** Customer support hub and payment information

**Sections:**

**A. Contact Form**
- Name (required)
- Email (required)
- Phone (optional)
- Subject dropdown (General Inquiry, Order Issue, Product Question, Partnership)
- Message textarea (required, min 50 chars)
- File attachment (optional, for order issues)
- Submit button

**B. Physical Location**
- Store address (with embedded Google Maps)
- Operating hours
- Phone number
- Email address

**C. M-Pesa Payment Information**
- Paybill number
- Account number / Till number
- Instructions for payment
- Payment reference format
- Note: "Include your order number in payment reference"

**Technical:** `contact.html` + `src/pages/contact.js` - Form validation + email/Slack integration

---

### 2.7 Admin Dashboard (`/admin` - `admin.html`)

**Purpose:** Protected administrative interface

**Authentication:**
- Route protection via middleware
- JWT token validation (Supabase)
- Role-based access (admin only)
- Auto-logout after 30 min inactivity

**Dashboard Sections:**

**A. Overview Cards**
- Total orders (today/this week/this month)
- Total revenue
- Pending orders
- Low stock alerts (products ≤ 5 units)

**B. Navigation Tabs**
1. Products Management
   - List view (table with search, filter by category)
   - Add New Product modal
   - Edit Product (pre-filled form)
   - Delete Product (with confirmation)
   - Bulk actions (activate/deactivate)

2. Orders Management
   - Order list (table with status badges)
   - Filter by status (Pending, Confirmed, Shipped, Delivered, Cancelled)
   - View order details modal
   - Update order status (dropdown action)
   - Mark as paid / unpaid

3. Inventory Management
   - Stock levels table
   - Quick update (inline编辑)
   - Low stock report

4. Customer Management (optional)
   - Customer list
   - Order history per customer
   - Block customer (if abuse)

5. Analytics Dashboard
   - Revenue chart (last 30 days)
   - Top selling products
   - Category performance
   - Conversion rate

**Technical:** `admin.html` + `src/pages/admin.js` - All API calls via `/api/admin.js` with auth headers

---

## 3. USER FLOW DIAGRAMS

### 3.1 Core Purchase Flow (Anonymous User → Customer)

```
[Homepage]
     ↓
[Browse Hero → Click CTA]
     ↓
[Shop Page]
     ↓
[Filter/Sort Products] → [Search]
     ↓
[Product Detail Page]
     ↓
[Select Size/Color/Qty] → [Add to Cart]
     ↓
[Cart & Checkout (mobile or desktop)]
     ↓
[Shipping Form] → [Select Payment] → [Place Order]
     ↓
[Order Confirmation]
     ↓
[Track Order] (via email/SMS link or manual entry)
     ↓
[Track Order Page] (status updates until delivery)
```

**Key Decision Points:**
- Continue shopping vs. Proceed to checkout
- M-Pesa vs. Cash on Delivery
- Guest checkout (default) vs. Account creation (future)

---

### 3.2 Admin Workflow (Authenticated Admin)

```
[Admin Login] (via existing auth or direct token)
     ↓
[Admin Dashboard - Overview]
     ↓
[Pick Management Tab]
     ├── Products → Add/Edit/Delete/Update Stock
     ├── Orders → View → Update Status
     ├── Inventory → Adjust Stock Levels
     └── Analytics → Review Performance
     ↓
[Logout] (or Session Expiry)
```

---

## 4. RESPONSIVE BREAKPOINT STRATEGY

### 4.1 Viewport-Based Implementation

**Mobile-First (default):** `cart_checkout.html` loaded
- 320px - 767px width
- Single column layout
- Touch-optimized
- Collapsible sections

**Tablet/Desktop:** `cart_checkout_desktop.html` loaded
- 768px+ width
- Two-column layout with sticky sidebar
- Hover interactions
- Larger form fields

**Detection Method:**
- Server-side User-Agent detection (Vercel functions)
- Fallback to CSS media queries for component adjustments
- JavaScript window.matchMedia for dynamic switches (if resizing)

**Note:** Current implementation has `cart.html`. bifurcation will require renaming and server-side routing logic.

---

## 5. AUTHENTICATION & AUTHORIZATION ARCHITECTURE

### 5.1 Protected Route Pattern

**Implementation:** `src/utils/auth-guard.js`

```javascript
// Middleware pattern for client-side protection
const checkAdminAuth = async () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    redirectToLogin();
    return false;
  }
  
  const isValid = await validateToken(token);
  if (!isValid) {
    clearSession();
    redirectToLogin();
    return false;
  }
  
  return true;
};

// Apply to admin page load
if (window.location.pathname === '/admin') {
  checkAdminAuth().then(authorized => {
    if (!authorized) return;
    initAdminDashboard();
  });
}
```

### 5.2 API-Level Protection

**Headers Required:** `Authorization: Bearer <JWT_TOKEN>`

**Rate Limiting:** 30 requests/minute per IP address

**Token Validation:**
- Verify signature with Supabase JWT secret
- Check expiration (exp claim)
- Check role claim (if implemented)

**Error Responses:**
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (valid token but insufficient permissions)

---

## 6. CROSS-CUTTING CONCERNS

### 6.1 SEO & Meta Tags
- Dynamic meta per page (Open Graph, Twitter Cards)
- Structured Data (JSON-LD) for products

### 6.2 Accessibility (WCAG 2.1 AA)
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management for modals

### 6.3 Analytics Events
- Page views
- Product impressions
- Add to cart clicks
- Checkout initiation
- Purchase completion

### 6.4 Error Handling
- Global error boundary (for SPA navigation)
- API error feedback (toast notifications)
- Retry logic for failed requests

---

## 7. FUTURE ENHANCEMENTS (PHASE 2)

- User registration & account area
- Wishlist / Save for later
- Multi-currency support
- Customer reviews with images
- Product recommendation engine
- Mobile app (React Native / Flutter)
- Admin mobile app

---

**Document Owner:** Kilo Engineering Team  
**Last Updated:** 2026-05-07  
**Status:** Active Architecture Reference
