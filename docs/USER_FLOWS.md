# USER FLOW DOCUMENTATION

## Multi-Platform E-commerce Application - Faith & Fashion Nairobi

**Version:** 2.0  
**Document Type:** User Journey & Interaction Specifications  
**Audience:** Product, Design, Engineering, QA

---

## TABLE OF CONTENTS

1. [Core Purchase Funnel](#1-core-purchase-funnel)
2. [Product Discovery Flow](#2-product-discovery-flow)
3. [Checkout Flow (Responsive Split)](#3-checkout-flow-responsive-split)
4. [Post-Purchase Experience](#4-post-purchase-experience)
5. [Support & Help Flow](#5-support--help-flow)
6. [Admin Management Flow](#6-admin-management-flow)
7. [Error States & Exception Handling](#7-error-states--exception-handling)
8. [Interaction Specifications](#8-interaction-specifications)

---

## 1. CORE PURCHASE FUNNEL

### 1.1 Journey Overview

**Entry Points:** Homepage, Shop page, Product page, Search results  
**Exit Points:** Order confirmation, Cart abandonment  
**Average Steps:** 5-7 clicks to conversion  
**Key Metric:** Conversion rate per step

---

### 1.2 Homepage → Product Detail

**Step 1: Homepage Hero Engagement**

| Element | Interaction | Expected Response |
|---------|-------------|-------------------|
| Hero banner image | Click anywhere | Navigate to featured product or campaign landing |
| "Shop Now" CTA button | Tap/Click | Scroll to featured products or redirect to `/shop?featured=true` |
| Category card (Men/Women/Kids) | Tap/Click | Navigate to `/shop?category=men` (or respective) |
| Search bar (top header) | Type + Enter | Navigate to `/shop?search=<query>` |
| Featured product card | Tap/Click | Navigate to `/product/:id` |

**Success Criteria:** User reaches product listing or PDP within 2 clicks

---

**Step 2: Shop Page Product Discovery**

| Element | State/Action | Response |
|---------|--------------|----------|
| Filter sidebar | Open/close (mobile) | Sidebar slide-in with animation |
| Category filter | Select "Women" | URL updates to `?category=women`, grid refreshes |
| Price range slider | Drag max to 2000 | Real-time filtering (debounced 300ms) |
| Sort dropdown | Select "Price: Low to High" | Grid reorders ascending |
| Pagination | Click page 2 | New page of results, scroll to top |
| Quick View button | Hover then click | Modal opens with product summary + "Add to Cart" |
| Product grid item | Click image or title | Navigate to PDP |

**Technical:** URL-driven state (history.pushState), preserving filter state across sessions (localStorage)

---

**Step 3: Product Detail Page (PDP) Engagement**

**Screen States:**
1. **Initial Load** - Skeleton loading state for images
2. **Data Loaded** - Gallery + info + add-to-cart ready
3. **Out of Stock** - Disabled size/color buttons, "Notify Me" option
4. **Added to Cart** - Toast confirmation, cart icon updates

**Decision Flowchart:**
```
[View Product]
     ↓
[Select Size]
     ├─ Unavailable → Show "Out of stock" tooltip
     └─ Available → Highlight size button
     ↓
[Select Color] (optional if multiple colors)
     ↓
[Select Quantity] (1-10 max)
     ↓
[Add to Cart] → [Cart flyout opens with item summary]
     ↓
[Continue Shopping] OR [Proceed to Checkout]
```

**User Actions & Feedback:**

| Action | Immediate Feedback | Persisted State |
|--------|-------------------|-----------------|
| Size selection | Border highlight, accessible label announced | Size ID stored in session |
| Quantity change | Cart subtotal preview updates | Quantity stored in temp state |
| Add to Cart | Cart badge increments, toast "Added" | Item saved to localStorage cart |
| Image gallery click | Main image swaps, zoom activated | Last viewed image saved for session |

---

### 1.3 Cart & Checkout Decision

**Trigger:** User clicks "Proceed to Checkout" or cart icon

**Branch Point 1: Cart Empty**
- Show empty cart state with "Continue Shopping" CTA
- Recommendation carousel below

**Branch Point 2: Cart Has Items**
- Proceed to `/checkout` (responsive bifurcation occurs here)

---

## 2. PRODUCT DISCOVERY FLOW

### 2.1 Browsing Behavior

**Path A: Category-First**
```
Homepage Category Card
    → Shop Page with pre-filtered category
    → PDP
```

**Path B: Search-First**
```
Search bar entry (e.g., "blue dress")
    → Shop Page with ?search=blue%20dress
    → Auto-suggest during typing (if implemented)
    → PDP
```

**Path C: Discovery (Infinite Scroll)**
```
Shop Page
    → Scroll to bottom → Load next page (infinite)
    → Continue until PDP click
```

---

### 2.2 Filtering Logic

**Hierarchical Filters (AND logic):**
```
Category = Women
AND Subcategory = Dresses
AND Color = Blue
AND Size = M
AND Price ≤ 3000
AND In Stock = true
```

**Result:** Intersection of all selected criteria

**Filter Persistence:**
- Filters stored in URL query string
- Page reload maintains filter state
- Back button restores previous filter set

**Mobile UX:**
- Filters as off-canvas drawer (slide from left)
- Apply button to commit changes (vs real-time on desktop)
- Clear all filters link

---

## 3. CHECKOUT FLOW (RESPONSIVE SPLIT)

### 3.1 Device Detection Logic

```
IF viewport width < 768px
    LOAD cart_checkout.html (mobile-optimized)
ELSE
    LOAD cart_checkout_desktop.html (desktop-optimized)
```

**Server-Side Detection (Vercel Edge):**
```javascript
// api/route-checkout.js
export const config = {
  matcher: '/checkout'
}

export default async function handler(req) {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  
  const filename = isMobile ? 'cart_checkout.html' : 'cart_checkout_desktop.html';
  return NextResponse.rewrite(new URL(`/${filename}`, req.url));
}
```

**Client-Side Fallback (if needed):**
- CSS media queries adjust layout
- JavaScript loads appropriate `cart.js` module variant

---

### 3.2 Mobile Checkout Flow (`cart_checkout.html`)

**Screen 1: Review Cart**
```
Visual: [Product Image x5]
       [Name]    [Qty]    [Price]    [Total]
       Subtotal: KES 12,750
       Shipping: KES 300
       ────────────────────────────────
       Total: KES 13,050

[Proceed to Shipping] (sticky bottom button)
```

**User Actions:**
- Tap "-" / "+" to adjust quantity → subtotal recalculates
- Tap "Remove" → item removed, toast "Removed from cart"
- Tap "Continue Shopping" → back to shop

**Screen 2: Shipping Information**

Form Fields (vertical stack):
1. Full Name (text input, required)
2. Phone Number (tel input, required, format: 07XXXXXXXX or +2547XXXXXXXX)
3. Email (email input, required)
4. Street Address (textarea, required)
5. City / Estate (text input)
6. Delivery Notes (textarea, optional, "Leave at gate, call upon arrival")

**Inline Validation:**
- Phone: regex pattern validation on blur
- Email: standard email format validation
- Required: red border + error message if empty on submit

**CTA:** "Continue to Payment" (bottom sticky)

---

**Screen 3: Payment Selection**

```
○ M-Pesa (Recommended)   [M-Pesa logo]
   Pay via M-Pesa at checkout. You'll receive instructions via SMS.

○ Cash on Delivery
   Pay when your order arrives. Additional KES 300 fee applies.

[M-Pesa Paybill Number Display]
Paybill: 123456
Account: <auto-generated order ID>
```

**If M-Pesa Selected:**
- Show animation "Wait for payment confirmation"
- Auto-poll API every 30s for payment status (up to 5 min)
- If timeout: Show "Payment not received, retry or choose COD"

**If COD Selected:**
- Show fee amount
- Continue to order summary

---

**Screen 4: Order Summary + Place Order**

`[Sticky Bottom Panel]`
```
Order #20240507-12345
Items:     KES 12,750
Shipping:  KES 300
COD Fee:   KES 300 (if applicable)
────────────────────────────
TOTAL:     KES 13,350
```

`[Main Area]`
- Shipping address review
- Payment method review
- Edit links for each section

`[Place Order Button]`
- Full-width green button
- Disabled until payment method selected
- On click: Show spinner → API call → redirect to confirmation

**Success Flow:**
- Clear cart from localStorage
- Show success toast
- Redirect to `/order-confirmation/:orderId`

**Failure Flow:**
- Show error message "Payment failed, please try again"
- Stay on page, highlight error field

---

### 3.3 Desktop Checkout Flow (`cart_checkout_desktop.html`)

**Two-Column Layout:**

`Left Column (75% width)`
```
[Progress Bar: Cart → Shipping → Payment → Review]

[Cart Items Table]
+------------------+-----+----------+----------+
| Product          | Qty | Price    | Total    |
+------------------+-----+----------+----------+
| Blue Dress M     | 1   | 3,500    | 3,500    |
| White Blouse L   | 2   | 1,800    | 3,600    |
+------------------+-----+----------+----------+
|                                    Subtotal: 12,750 |
|                                    Shipping:  300    |
|                                    ────────────────── |
|                                    Total:     13,050 |
+----------------------------------------------------+

[Shipping Form] (2-column grid)
┌─────────────────────┬─────────────────────────────┐
│ Full Name           │ Phone Number                │
│ [_________________] │ [07____________________]   │
├─────────────────────┼─────────────────────────────┤
│ Email               │ City / Estate               │
│ [_________________] │ [_________________________]│
├─────────────────────┴─────────────────────────────┤
│ Street Address                                 │
│ [_____________________________________________]│
├─────────────────────────────────────────────────┤
│ Delivery Notes (optional)                      │
│ [_____________________________________________]│
└─────────────────────────────────────────────────┘

[Payment Selection]
○ M-Pesa  ○ Cash on Delivery (KES 300 fee)
```

`Right Sticky Column (25% width)`
```
[Order Summary]
Sticky on scroll

Subtotal:          KES 12,750
Shipping:          KES 300
────────────────────────────
Total:             KES 13,050

[Promo Code]
[ Enter code______] [Apply]

[Trust Badges]
✓ Secure SSL Encrypted
✓ Money-Back Guarantee
✓ 24/7 Support

[Place Order Button]
```

**Desktop Interactions:**
- Hover on cart items → show "Remove" icon
- Form labels float on focus (Material Design)
- Real-time validation with checkmark icons
- Sticky order summary maintains visibility on scroll

---

## 4. POST-PURCHASE EXPERIENCE

### 4.1 Order Confirmation Flow

**Immediately after successful payment:**
```
GET /api/orders/:orderId
     ↓
[Order Confirmation Page]
     ↓
[Display:]
✓ Success checkmark animation
"Thank you for your order, [Customer Name]!"

Order #: 20240507-12345
Items: 5
Total: KES 13,350
Delivery: 123 Main St, Nairobi
Est. Delivery: May 10-12, 2026

[Actions]
- [Track Order] (primary button)
- [Continue Shopping] (secondary button)
- [Share on WhatsApp] (social share icon)

[Email/SMS Notification Sent]
"Confirmation sent to customer@email.com / +2547..."
```

**Email Triggered:**
- Order details HTML email
- M-Pesa payment instructions (if applicable)
- Tracking link

---

### 4.2 Order Tracking Flow

**Entry Points:**
1. Email link: `https://faithandfashion.co.ke/track?order=ORDER123`
2. SMS link (same)
3. Manual: Navigate to `/track` and enter order ID

**Tracking Page States:**

| State | UI Display | Auto-Refresh |
|-------|------------|--------------|
| Processing | "We've received your order" (gray) | No |
| Confirmed | "Order confirmed, preparing for pickup" (blue) | Every 30s |
| Shipped | "Out for delivery" (orange) | Every 15s |
| Delivered | "Delivered ✓ Thank you!" (green) | No |
| Cancelled | "Order cancelled" (red) | No |

**Tracking Info:**
- Timeline graphic (vertical stepper)
- Estimated delivery date (dynamic)
- Support phone number (if delayed)
- Option to "Contact Support" from this page

---

## 5. SUPPORT & HELP FLOW

### 5.1 Contact Page Journey

**User Path:**
```
Footer "Contact Us" link
    → /contact
    → Choose contact method:
        ├─ Fill form → Submit → "Message sent, we'll reply in 24h"
        ├─ View map → Click → Opens Google Maps app
        └─ View M-Pesa details → Copy paybill/account
```

**Form Submission Flow:**
- Client-side validation (required fields, email format)
- reCAPTCHA v3 (invisible) for bot protection
- Submit to `/api/contact` (POST)
- Show spinner → Success toast → Form reset
- Admin notified via Slack/email

**M-Pesa Section Purpose:**
- Serve walk-in customers who prefer direct payment
- Provide payment details for manual checkout orders
- Display clear instructions to reduce payment errors

---

## 6. ADMIN MANAGEMENT FLOW

### 6.1 Authentication Entry

**Route Protection:**
```
User navigates to /admin
     ↓
Client-side check: localStorage.getItem('admin_token')?
     ↓
No → Redirect to /admin-login (or show auth modal)
     ↓
Yes → Validate token with /api/auth/validate
     ↓
Invalid → Clear storage → Redirect to login
Valid → Show Admin Dashboard
```

**Admin Login Form:**
- Email (admin@faithandfashion.co.ke)
- Password (service role key or dedicated admin password)
- "Remember me" checkbox (extends session to 30 days)
- Submit → JWT issued (1 hour expiry)

---

### 6.2 Dashboard Navigation

**Tab Structure (Top Navigation):**
1. **Overview** (default landing)
   - KPI cards (4x)
   - Revenue chart (last 7 days)
   - Recent orders table (last 5)

2. **Products** (Product Management)
   - Table search + category filter
   - "Add New Product" button → Modal form
   - Row actions: Edit (pencil icon), Delete (trash icon)
   - Bulk activate/deactivate via checkboxes

   **Add/Edit Product Modal:**
   - Fields: Name, Description, Category, Subcategory, Price, Sale Price, Image URL, Stock Qty, Size, Color, Tags
   - Image preview (on URL entry)
   - "Save" or "Cancel"

3. **Orders** (Order Management)
   - Table: Order ID, Customer, Date, Total, Status, Payment method
   - Filter by status dropdown
   - Row click → Modal with full order details
   - Status update dropdown in modal → "Update Status" button
   - Send SMS notification checkbox (optional)

4. **Inventory** (Stock Management)
   - Table: Product, Current Stock, Reorder Level, Status
   - Inline quantity edit (double-click to edit)
   - "Update" button per row
   - Low stock filter

5. **Analytics** (Reporting)
   - Date range picker
   - Revenue line chart (ApexCharts or Chart.js)
   - Top 10 products (bar chart)
   - Category breakdown (pie chart)

---

### 6.3 Admin Actions & API Calls

| Action | API Endpoint | Method | Auth Required |
|--------|-------------|--------|---------------|
| Add Product | `/api/admin/products` | POST | Bearer token |
| Edit Product | `/api/admin/products/:id` | PATCH | Bearer token |
| Delete Product | `/api/admin/products/:id` | DELETE | Bearer token |
| Update Order Status | `/api/admin/orders/:id/status` | PATCH | Bearer token |
| Fetch Products | `/api/admin/products` | GET | Bearer token |
| Fetch Orders | `/api/admin/orders` | GET | Bearer token |

**Error Handling:**
- 401 → Redirect to login
- 403 → Show "Insufficient permissions" toast
- 429 → "Rate limit exceeded, try again in X seconds"
- 500 → "Server error, please contact support"

---

## 7. ERROR STATES & EXCEPTION HANDLING

### 7.1 Network Errors

**Scenario:** API call fails (timeout, 500, offline)

**UX Response:**
1. Show retry toast (non-blocking)
2. Display offline indicator if truly offline
3. Auto-retry with exponential backoff (max 3 attempts)
4. On permanent failure: Show error screen with "Try Again" button

**Error Screen Template:**
```
[Error illustration]
Oops! Something went wrong.

We couldn't load the products. Please check your connection and try again.

[Retry Button]   [Go Home]
```

---

### 7.2 Cart Errors

**Scenario:** Adding item fails (out of stock, API error)

**Response:**
- Show toast: "Sorry, this item is currently out of stock"
- Disable "Add to Cart" button temporarily
- Show "Notify when available" option

---

### 7.3 Checkout Errors

**Scenario:** Payment fails (M-Pesa timeout, invalid card)

**Response:**
- Clear error message at top: "Payment not received. Please try again or choose a different method."
- Highlight payment selection area
- Keep cart items preserved (don't empty)
- "Retry Payment" button

---

### 7.4 Auth Errors

**Scenario:** Admin token expired

**Response:**
- Silent re-authentication attempt (refresh token)
- If refresh fails → show session expiry modal
- Modal: "Your session has expired. Please log in again."
- Buttons: [Log In Now] (redirects to `/admin/login`) [Cancel] (stays on page, limited functionality)

---

## 8. INTERACTION SPECIFICATIONS

### 8.1 Timing & Animation

| Interaction | Duration | Easing | Purpose |
|-------------|----------|--------|---------|
| Page transition | 300ms | ease-out | Smooth navigation |
| Toast notification | 400ms fade-in | ease-in-out | Attention without blocking |
| Modal open | 250ms scale-up | ease-out | Focus on task |
| Loading spinner | Infinite (indeterminate) | linear | Ongoing feedback |
| Cart flyout | 350ms slide-up | ease-out | Quick cart preview |

---

### 8.2 Loading States

**Skeleton Screens (Initial Load):**
- Homepage: Hero placeholder → card placeholders (gray rectangles)
- Shop: Grid of 8-12 product card skeletons
- PDP: Image placeholder → text block placeholders

**Spinner Usage:**
- Button loading state (disabled, spinner inside)
- Full page overlay loading (initial app boot)

**Skeleton vs Spinner:**
- Skeleton: For content that will appear (images, text)
- Spinner: For actions that must wait (form submit, API call)

---

### 8.3 Microinteractions

| Element | Interaction | Effect |
|---------|-------------|--------|
| Product card | Hover | Shadow lift, "Quick View" button appears |
| Size button | Click | Border color change, accessible `aria-pressed` |
| Add to Cart button | Click | Scale down briefly, then bounce on success |
| Cart icon (header) | Click | Slide-up cart flyout panel |
| Form input | Focus | Border color transition, label floats |
| Toggle/Radio | Change | Smooth checkmark animation |
| Toast notification | Enter | Slide from top-right, auto-dismiss 4s |
| Sticky element | Scroll | Box shadow appears when stuck |

---

### 8.4 Accessibility Interactions

**Keyboard Navigation:**
- Tab order follows DOM
- Enter key submits forms
- Escape key closes modals/off-canvas
- Arrow keys navigate size/color options

**Screen Reader Announcements:**
- Live region for cart updates: "3 items in cart, total KES 12,750"
- Success/error toast announcements via `aria-live="polite"`

**Focus Management:**
- Modal trap focus within
- Return focus to trigger element on close
- Skip link for main content (hidden visually, shown on focus)

---

## APPENDIX A: STATE MANAGEMENT

### Cart State (localStorage schema)

```javascript
{
  "items": [
    {
      "product_id": "uuid",
      "size": "M",
      "color": "Blue",
      "quantity": 2,
      "price": 3500,
      "added_at": "2026-05-07T14:30:00Z"
    }
  ],
  "last_updated": "2026-05-07T14:35:00Z"
}
```

**Persistence:** Survives page refresh, cleared on successful order

### Session State (sessionStorage)

```javascript
{
  "current_page": "product",
  "filters": { "category": "women", "max_price": 5000 },
  "viewed_products": ["id1", "id2", "id3"]  // for recommendations
}
```

---

## APPENDIX B: URL SCHEMA

```
Public Routes:
  /                    Homepage
  /shop                Product listing (with optional filters)
  /product/:id         Product detail
  /checkout            Cart & checkout (responsive)
  /order-confirmation  Confirmation page
  /track               Track order
  /contact             Contact & support

Protected Routes:
  /admin               Admin dashboard (requires auth)

API Routes (Serverless):
  /api/config          Frontend configuration (env variables)
  /api/products        Public product listing
  /api/products/:id    Single product
  /api/cart            Cart operations
  /api/orders          Order creation + retrieval
  /api/admin/*         Admin-only endpoints (authenticated)
  /api/contact         Contact form submission
```

---

**Document Owner:** Kilo Engineering Team  
**Last Updated:** 2026-05-07  
**Related Documents:** SITEMAP.md, AUTH_ARCHITECTURE.md, RESPONSIVE_STRATEGY.md
