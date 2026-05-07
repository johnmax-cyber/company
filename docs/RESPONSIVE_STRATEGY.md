# RESPONSIVE STRATEGY: CART & CHECKOUT

## Bifurcated Implementation Guide

**Version:** 2.0  
**Target:** Mobile-First with Desktop Optimization  
**Platform:** Multi-Device E-commerce Checkout

---

## 1. STRATEGY OVERVIEW

### 1.1 Why Bifurcation?

Traditional responsive design (single HTML + CSS media queries) is **insufficient** for complex checkout flows because:

1. **Touch vs. Mouse Interaction Patterns** differ fundamentally
2. **Viewport Real Estate** requires different information hierarchy
3. **Performance** - Mobile needs lighter JS, desktop can handle richer interactions
4. **Form-Factor Optimization** - Mobile needs vertical stack, desktop benefits from multi-column

### 1.2 Implementation Model

```
Request → Server detects device → Serves appropriate HTML
                                    ├── cart_checkout.html (mobile)
                                    └── cart_checkout_desktop.html (desktop)
```

**Single Source of Truth:**
- Business logic shared via JavaScript modules
- API endpoints identical
- Styling shared via CSS custom properties (variables)

---

## 2. DEVICE DETECTION & ROUTING

### 2.1 Server-Side Detection (Vercel Edge Function)

**File:** `api/route-checkout.js`

```javascript
import { NextResponse } from 'next/server';

export const config = {
  matcher: '/checkout'
};

export async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  
  // Device detection logic
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
  const isTablet = /ipad|tablet|playbook|silk/i.test(userAgent);
  const viewportWidth = request.headers.get('viewport-width');
  
  // Decision matrix
  let targetFile;
  if (viewportWidth && parseInt(viewportWidth) >= 768) {
    targetFile = 'cart_checkout_desktop.html';
  } else if (isTablet) {
    // Tablet: can serve either based on design decision
    targetFile = 'cart_checkout_desktop.html'; // or mobile version
  } else {
    targetFile = 'cart_checkout.html';
  }
  
  // Rewrite to appropriate file while preserving URL
  const url = request.nextUrl.clone();
  url.pathname = `/${targetFile}`;
  
  return NextResponse.rewrite(url);
}
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "rewrites": [
    {
      "source": "/checkout",
      "destination": "/api/route-checkout"
    }
  ]
}
```

---

### 2.2 Client-Side Fallback

If server detection fails or user resizes window:

```javascript
// src/utils/checkout-redirect.js
function handleCheckoutRedirect() {
  const width = window.innerWidth;
  const isMobile = width < 768;
  const currentPath = window.location.pathname;
  
  // Prevent redirect loop
  if (currentPath.includes('cart_checkout')) return;
  
  // If viewing generic cart.html, redirect appropriately
  if (currentPath === '/checkout' || currentPath === '/cart') {
    const target = isMobile ? '/cart_checkout.html' : '/cart_checkout_desktop.html';
    window.location.replace(target);
  }
}

// Run on load
document.addEventListener('DOMContentLoaded', handleCheckoutRedirect);

// Optional: dynamic resize handler (with debounce)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Only redirect if on checkout and breakpoint crossed
    if (window.innerWidth >= 768 && window.location.pathname === '/cart_checkout.html') {
      window.location.replace('/cart_checkout_desktop.html');
    } else if (window.innerWidth < 768 && window.location.pathname === '/cart_checkout_desktop.html') {
      window.location.replace('/cart_checkout.html');
    }
  }, 250);
});
```

---

## 3. MOBILE-FIRST VERSION (`cart_checkout.html`)

### 3.1 Layout Specifications

**Viewport:** 320px - 767px (covers most smartphones)  
**Orientation:** Portrait primary, landscape adapted  
**Touch Targets:** Minimum 44px × 44px (Apple HIG standard)

#### Layout Structure (Single Column)

```
┌─────────────────────────────┐
│  ← Back    Checkout          │ ← Header (fixed)
├─────────────────────────────┤
│                             │
│  [Progress: 3 steps]        │
│  ●○○○ Cart → Shipping → Pay │
├─────────────────────────────┤
│                             │
│  [CART ITEMS SECTION]       │
│  ┌─────────────────────┐    │
│  │ [IMG] Product Name  │    │
│  │ Size: M | Qty: 1    │    │
│  │     KES 3,500       │    │
│  │ [-][1][+] [Remove]  │    │
│  └─────────────────────┘    │
│  (repeat for each item)     │
│                             │
│  [COLLAPSIBLE SUMMARY]      │
│  Subtotal: KES 12,750       │ ← Expandable
│  Shipping: KES 300          │    summary
│  ─────────────────────────  │
│  Total:    KES 13,050       │
├─────────────────────────────┤
│                             │
│  [SHIPPING FORM]            │
│  Full Name: [____________]  │
│  Phone:    [07____________] │
│  Email:    [@______________]│
│  Address:  [textarea]       │
│  Notes:    [textarea]       │
│                             │
│  [PAYMENT SELECTION]        │
│  ● M-Pesa   (Recommended)   │
│  ○ Cash on Delivery (+300)  │
│                             │
│  [PLACE ORDER]              │ ← Sticky footer
│  KES 13,050                 │    button
├─────────────────────────────┤
│                             │
│  [FOOTER]                   │
│  © 2026 Faith & Fashion     │
└─────────────────────────────┘
```

---

### 3.2 Mobile-Specific UX Patterns

#### Pattern 1: Collapsible Order Summary

**Default:** Summary minimized to show only total  
**Interaction:** Tap summary bar → expands to reveal subtotal, shipping, tax breakdown  
**Benefit:** Reduces scroll on small screens

```html
<div class="summary-toggle" onclick="toggleSummary()">
  <span>Order Total: <strong>KES 13,050</strong></span>
  <span class="arrow">▼</span>
</div>
<div id="summary-details" class="hidden">
  <!-- detailed breakdown -->
</div>
```

---

#### Pattern 2: Bottom Sheet for Cart

**Alternative (if not on separate page):**  
Swipe-up cart drawer from bottom (like iOS Maps)  
- 50% screen height  
- Drag down to dismiss  
- "Checkout" button prominent at bottom

---

#### Pattern 3: Progressive Disclosure

Form sections appear sequentially:
1. Cart review (initial view)
2. After tapping "Proceed" → shipping form slides up
3. After "Continue" → payment selection slides up
4. After selecting payment → order summary + place order

**Benefit:** Cognitive load reduction, feels like a wizard

---

### 3.3 Touch Interactions

| Element | Interaction | Feedback |
|---------|-------------|----------|
| Size button | Tap | Blue border, haptic (if available) |
| "–" quantity | Long-press → rapid decrease | Visual count updates rapidly |
| "+" quantity | Tap | Subtle scale bounce on number |
| Remove item | Swipe left | Red background appears, tap Confirm |
| Form field | Tap → scroll into view | Field border glows |
| Place order | Tap → disabled state | Full-screen spinner overlay |

---

### 3.4 Performance Optimizations

- **Image loading:** Lazy load cart thumbnails (IntersectionObserver)
- **Debounced inputs:** Phone validation only on blur, not every keystroke
- **Minimal DOM:** One-way data flow, direct DOM manipulation for list updates
- **No heavy libraries:** Vanilla JS only (≈ 15KB gzipped checkout JS)

---

## 4. DESKTOP OPTIMIZED VERSION (`cart_checkout_desktop.html`)

### 4.1 Layout Specifications

**Viewport:** 768px - 2560px (tablet portrait → 4K)  
**Primary Breakpoint:** 1200px (max-content width constraint)

#### Layout Structure (Two-Column Grid)

```
┌─────────────────────────────────────────────────────────────┐
│ Header (logo, nav, user, cart icon)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress: [Cart] → [Shipping] → [Payment] → [Review]     │
│                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────┐ │
│  │ MAIN CONTENT (75%)           │  │ SIDEBAR (25%)      │ │
│  │                              │  │ ────────────────── │ │
│  │  [Cart Items Table]          │  │ Order Summary      │ │
│  │  Product │ Qty │ Price │Total│  │                    │ │
│  │  Dress   │  1  │ 3500 │3500 │  │ Subtotal: 12,750   │ │
│  │  Blouse  │  2  │ 1800 │3600 │  │ Shipping:    300   │ │
│  │                              │  │ ────────────────── │ │
│  │  [Shipping Form]             │  │ Total:      13,050 │ │
│  │  [Name________________]      │  │                    │ │
│  │  [Email_________________]     │  │ [Promo Code]       │ │
│  │  [Address________________]    │  │  [Input] [Apply]   │ │
│  │                              │  │                    │ │
│  │  [Payment Selection]         │  │ Trust Badges:      │ │
│  │  ○ M-Pesa   ○ COD            │  │ ✓ SSL Encrypted    │ │
│  │                              │  │ ✓ Money-back       │ │
│  │                              │  │                    │ │
│  │                              │  │ ────────────────── │ │
│  │                              │  │ [PLACE ORDER]      │ │
│  │                              │  │ Large primary CTA  │ │
│  └──────────────────────────────┘  └────────────────────┘ │
│                                                             │
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 Desktop-Specific UX Patterns

#### Pattern 1: Sticky Sidebar

**Behavior:** Right sidebar remains visible on scroll  
**Use Case:** Order summary always in view to remind user of total  
**CSS:**
```css
.sidebar {
  position: sticky;
  top: 100px; /* below header */
}
```

---

#### Pattern 2: Inline Editing

**Cart items:** Hover reveals "Remove" and "Edit" buttons  
**Form fields:** Floating labels (Material Design-inspired)  
**Benefit:** Discoverable advanced options, cleaner visual default

---

#### Pattern 3: Hover Previews

**Product name:** Hover shows tooltip with quick product info  
**Size selector:** Hover shows size chart popover  
**Payment method:** Hover shows detailed explanation of fees/timing

---

#### Pattern 4: Keyboard Shortcuts

**Desktop-only efficiency:**
- `Enter` in form fields → move to next field
- `Esc` → cancel / close modal
- `Ctrl + Enter` on last field → place order

---

### 4.3 Visual Design Considerations

**Desktop treatment vs Mobile:**
- **Shadows:** Elevated cards with `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- **Border radius:** 8px (slightly sharper than mobile's 12px)
- **Typography:** 16px base, larger headings (24-32px)
- **Colors:** Same palette, more subtle gradients

**Contrast Requirements:**
- Buttons: WCAG AA minimum (4.5:1)
- Text on backgrounds: 7:1 for body, 4.5:1 for large text

---

## 5. SHARED INFRASTRUCTURE

### 5.1 Common CSS Variables

**File:** `src/styles/checkout.css` (included in both versions)

```css
:root {
  /* Color Palette */
  --primary: #2E7D32;        /* Faith & Fashion brand green */
  --primary-hover: #1B5E20;
  --accent: #FF6F00;         /* M-Pesa orange */
  --error: #D32F2F;
  --success: #388E3C;
  --warning: #F57C00;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Poppins', sans-serif;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  
  /* Breakpoints (for shared queries) */
  --bp-sm: 576px;
  --bp-md: 768px;
  --bp-lg: 992px;
  --bp-xl: 1200px;
}

/* Shared component: cart item */
.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid #eee;
}
```

---

### 5.2 Shared JavaScript Modules

Both versions import from same business logic modules:

```javascript
// src/services/cart-service.js (shared)
export const CartService = {
  getItems: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  
  updateQuantity: (productId, size, color, qty) => { /* ... */ },
  
  removeItem: (productId, size, color) => { /* ... */ },
  
  calculateTotals: () => { /* returns {subtotal, shipping, tax, total} */ }
};

// src/services/order-service.js (shared)
export const OrderService = {
  createOrder: (cart, shipping, payment) => {
    return fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, shipping, payment })
    });
  }
};
```

---

### 5.3 Form Validation (Shared)

**File:** `src/utils/validators.js`

```javascript
export const validators = {
  phone: (value) => {
    const regex = /^(07\d{8}|\+2547\d{8})$/;
    return regex.test(value.replace(/\s/g, ''));
  },
  
  email: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  
  required: (value) => {
    return value && value.trim().length > 0;
  }
};

// Usage in both versions
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!validators.phone(phoneInput.value)) {
    showError(phoneInput, 'Invalid phone number');
    return;
  }
  
  // Continue...
});
```

---

## 6. RESPONSIVE BREAKPOINT MAPPING

### 6.1 Viewport vs. Version Matrix

| Viewport Width | Device Type | Served File | Notes |
|----------------|-------------|-------------|-------|
| 0 - 767px | Mobile phone (portrait/landscape) | `cart_checkout.html` | Touch-optimized, single column |
| 768 - 1023px | Tablet portrait / small laptop | `cart_checkout_desktop.html` | Two-column layout starts here |
| 1024 - 1439px | Standard laptop / tablet landscape | `cart_checkout_desktop.html` | Full desktop experience |
| 1440px+ | Desktop / large monitor | `cart_checkout_desktop.html` | Max-width constrained to 1200px |

---

### 6.2 CSS Fallback within Each Version

Even within bifurcated files, CSS media queries fine-tune layout:

```css
/* Mobile version - adapt to larger phones/tablets */
@media (min-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop version - constrain on ultra-wide */
@media (min-width: 1600px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

## 7. MIGRATION PATH (Current → Bifurcated)

### Step 1: Duplicate & Rename
```
cart.html → cart_checkout.html (mobile, refactor)
cart.html → cart_checkout_desktop.html (duplicate, refactor separately)
```

### Step 2: Server Detection
- Implement `/api/route-checkout` middleware
- Update `vercel.json` rewrites
- Test with different user agents

### Step 3: Mobile Refactor
- Single-column layout only (no desktop CSS remnants)
- Touch target sizing
- Bottom-sticky CTA button
- Collapsible sections

### Step 4: Desktop Refactor
- Two-column CSS Grid layout
- Sticky sidebar implementation
- Hover states on cards
- Larger form fields (16px min)

### Step 5: Sync Business Logic
- Extract shared functions to modules
- Ensure both versions call same API endpoints
- Test identical functionality

### Step 6: QA Matrix

| Test Case | Mobile | Desktop | Pass |
|-----------|--------|---------|------|
| Add item works | ✓ | ✓ | |
| Remove item works | ✓ | ✓ | |
| Form validation | ✓ | ✓ | |
| M-Pesa selection | ✓ | ✓ | |
| Place order success | ✓ | ✓ | |
| Responsive breakpoint | N/A | ✓ | |
| Touch targets | ✓ | N/A | |
| Sticky sidebar | N/A | ✓ | |
| Hover interactions | N/A | ✓ | |

---

## 8. PERFORMANCE METRICS

### 8.1 Target Performance

| Metric | Mobile Target | Desktop Target |
|--------|---------------|----------------|
| First Contentful Paint | < 1.5s | < 1.0s |
| Time to Interactive | < 3.5s | < 2.5s |
| Input Latency | < 50ms | < 50ms |
| Lighthouse Score | > 90 | > 90 |
| Bundle Size | < 50KB JS | < 80KB JS (more features okay) |

### 8.2 Optimization Techniques

**Common:**
- Image lazy loading with blur placeholder
- Code splitting (dynamic import of heavy modules)
- Caching of product data (5min localStorage)
- Service Worker for offline cart (future)

**Mobile-specific:**
- Reduced animation complexity
- Simplified validation messages (concise)
- Fewer DOM nodes in cart list

**Desktop-specific:**
- Advanced CSS (Grid, Flexbox) for layout
- Richer hover transitions
- Larger images (2x DPR assets)

---

## 9. ACCESSIBILITY COMPLIANCE

Both versions must meet WCAG 2.1 AA:

### Common Requirements
- **Keyboard navigation:** Tab through all form fields
- **Screen reader:** ARIA labels, live regions for cart updates
- **Focus management:** Visible focus ring, logical order
- **Color contrast:** 4.5:1 minimum for text

### Mobile Considerations
- **Touch target size:** Min 44×44px (larger than desktop's 32px)
- **Swipe gestures:** For image carousel, not for critical actions
- **Zoom support:** `touch-action: manipulation` doesn't break pinch-zoom

### Desktop Considerations
- **Skip navigation links** for keyboard users
- **Hover alternatives:** All hover-only info available via click/focus
- **Resize text:** Up to 200% without breaking layout

---

## 10. FUTURE ENHANCEMENTS

### 10.1 Tablet-Specific Version (Optional)

**Rationale:** Tablet portrait (768×1024) mixes mobile & desktop patterns  
**Decision:** Use desktop version but disable hover interactions (CSS `@media (hover: hover)`)

---

### 10.2 PWA Checkout

**Offline capability:**
- Service Worker caches checkout HTML, CSS, JS
- Cart stored in IndexedDB (sync on reconnect)
- Payment page requires online (for M-Pesa/Stripe)

---

### 10.3 Adaptive Images

**Serve optimally sized images per device:**
```html
<picture>
  <source media="(max-width: 767px)" srcset="product-thumb-320.jpg">
  <source media="(min-width: 768px)" srcset="product-thumb-640.jpg">
  <img src="product-thumb-640.jpg" alt="Product">
</picture>
```

---

## APPENDIX: REFERENCE IMPLEMENTATION

### File Structure
```
public/
├── cart_checkout.html           ← Mobile checkout
├── cart_checkout_desktop.html   ← Desktop checkout
└── checkout-redirect.js         ← Redirect logic

src/
├── pages/
│   ├── checkout-mobile.js       ← Mobile page controller
│   └── checkout-desktop.js      ← Desktop page controller
├── services/
│   ├── cart-service.js          ← Shared cart logic
│   └── order-service.js         ← Shared order logic
└── utils/
    └── validators.js            ← Shared validation
```

---

**Document Owner:** Kilo Frontend Architecture Team  
**Last Updated:** 2026-05-07  
**Related Documents:** SITEMAP.md, USER_FLOWS.md, AUTH_ARCHITECTURE.md
