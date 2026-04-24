# Faith & Fashion Nairobi - E-commerce Storefront

A complete, modern e-commerce website built with vanilla HTML, CSS, and JavaScript. Features a full product catalog, advanced filtering/search, product detail pages, shopping cart, checkout flow, and admin dashboard.

## Live Demo

https://company-cyber.vercel.app

## Features

### 🛍️ Product Catalog
- 28+ products across 4 categories (Men, Women, Kids, Books)
- Product cards with images, prices, badges (New, Sale, Out of Stock)
- Quick view and add to cart functionality
- Pagination support

### 🔍 Search & Filters
- Full-text search across product names, descriptions
- Category filters (Men, Women, Kids, Books)
- Price range slider (KSh 0 - 30,000)
- Size filters for clothing items
- In-stock toggle
- Active filter chips with clear/remove options

### 🔖 Sorting Options
- Featured (best sellers + rating)
- Price: Low to High
- Price: High to Low
- Name: A to Z / Z to A
- Newest arrivals
- Highest rated

### 📄 Product Detail Pages
- Image gallery with thumbnail navigation
- Price display with compare-at pricing
- Size selector (clothing items)
- Color selector
- Quantity selector
- Add to cart with toast notifications
- JSON-LD structured data for SEO
- Delivery & returns info
- Care instructions
- Related products carousel

### 🛒 Shopping Cart
- LocalStorage persistence
- Quantity adjustment controls
- Remove items
- Subtotal, shipping, and total calculation
- Sticky summary panel

### 🏦 Checkout Flow
- Customer information form (name, phone, email, address)
- Nairobi area selection
- Delivery notes
- Payment method selector (M-Pesa, Cash on Delivery)
- Order summary
- Order confirmation page with order ID
- Orders saved to localStorage

### 🏠 Homepage
- Hero section with CTAs
- Feature highlights (delivery, payments, returns, support)
- Featured categories grid
- Best Sellers section (8 products)
- New Arrivals section
- Why Choose Us feature cards
- Trust strip with guarantees

### 📞 Contact & Support
- Contact form with Supabase integration
- Multiple contact methods (phone, WhatsApp, email)
- Business hours

### 👑 Admin Dashboard
- Login system
- Product management (view, add, update, delete)
- Order management with status updates
- Statistics dashboard

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Flexbox & Grid, no frameworks
- **Backend**: Supabase (PostgreSQL, Auth, Storage via Edge Functions)
- **Deployment**: Vercel
- **Icons**: Unicode emojis for rapid prototyping
- **Images**: Unsplash placeholders (easy to swap with real product photos)

## File Structure

```
├── index.html              # Homepage
├── shop.html               # Product listing with filters
├── product.html            # Product detail page
├── cart.html               # Shopping cart
├── contact.html            # Contact form
├── admin.html              # Admin dashboard
├── products.json           # Product catalog (28 items)
├── config.js               # Supabase configuration
├── assets/
│   ├── css/
│   │   └── style.css       # All styles (responsive, modern)
│   └── js/
│       └── main.js         # Core JS (cart, admin, utilities)
└── supabase/
    └── schema.sql          # Database schema + RLS policies
```

## Installation & Local Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)
- [Optional] Live server extension

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/johnmax-cyber/company.git
   cd company
   ```

2. **Configure Supabase (Optional - uses local data as fallback)**
   
   Edit `config.js`:
   ```javascript
   window.__SUPABASE_URL__ = 'https://your-project.supabase.co';
   window.__SUPABASE_ANON_KEY__ = 'your-anon-key';
   ```

3. **Run Supabase Schema (if using Supabase backend)**
   
   Execute `supabase/schema.sql` in your Supabase SQL Editor.

4. **Run Locally**
   
   Open `index.html` in your browser, or use a local server:
   
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```
   
   Visit: `http://localhost:8000`

### Deploy to Vercel

1. Push to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variables (optional):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy!

## Product Data Structure

Each product in `products.json` includes:

```json
{
  "id": 1,
  "name": "Classic Dress Shirt",
  "category": "clothes",
  "subcategory": "men",
  "price": 4500,
  "compareAtPrice": 5200,
  "inStock": true,
  "images": ["..."],
  "description": "...",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["White", "Blue"],
  "tags": ["New", "Best Seller"],
  "rating": 4.8,
  "reviewsCount": 127
}
```

## Cart Persistence

The shopping cart is stored in `localStorage` under the key `cart`. Each cart item includes:

- `id` - Product ID
- `name` - Product name
- `price` - Product price (KES)
- `image` - Product image URL
- `qty` - Quantity
- `size` - Selected size (optional)
- `color` - Selected color (optional)

## Checkout & Orders

Completed orders are stored in `localStorage` under the key `orders`. Each order includes:

- Customer details (name, phone, email)
- Delivery address & area
- Items array
- Payment method
- Order total
- Timestamp

## Admin Panel

**Default Password**: `admin123` (can be configured via Supabase / Edge Functions)

### Features
- View all products
- Add new products
- Update existing products
- Delete products
- View all orders
- Update order status (Pending → Confirmed → Delivered)
- Dashboard statistics

### Security Note

For production, admin operations should use Supabase **Service Role Key** via a secure backend (Edge Function) rather than exposing database credentials in frontend code. The current implementation uses Row Level Security (RLS) to prevent unauthorized reads/writes. Admin credentials should be handled via Supabase Auth or a secure login system.

## Responsive Design

Fully responsive across all device sizes:

- **Desktop** (≥1024px): Full grid layouts, sidebar filters
- **Tablet** (768px - 1023px): Adjusted grids, stacked layouts
- **Mobile** (≤767px): Single column, hamburger menu, drawer filters

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- ⚡ Lazy-loaded images (`loading="lazy"`)
- ⚡ Efficient filtering/sorting algorithms
- ⚡ Minimal DOM manipulation
- ⚡ CSS transitions for smooth interactions
- ⚡ Toast notifications for user feedback
- ⚡ No heavy frameworks or libraries

## SEO Features

- Semantic HTML5 with proper heading hierarchy
- Meta tags (title, description, theme-color)
- Open Graph tags (og:title, og:description, og:url, og:type)
- JSON-LD Product structured data on PDP
- ARIA labels for accessibility
- Proper alt text on images

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA attributes for interactive elements
- ✅ Keyboard navigation support
- ✅ Focus-visible states
- ✅ Screen reader friendly labels
- ✅ Color contrast compliant (WCAG)
- ✅ Form labels properly associated

## Customization

### Branding

Edit these values to customize:

- **Brand Name**: Update in all HTML pages
- **Colors**: Modify CSS variables in `:root` (style.css)
  ```css
  --primary: #1e3a5f;     /* Main brand color */
  --secondary: #c53030;   /* Accent color */
  --background: #f8fafc;  /* Page background */
  ```
- **Categories**: Update filters in `shop.html`
- **Delivery Info**: Edit in `product.html` and `checkout.html`
- **Policies**: Update return window, delivery areas

### Adding New Products

1. Edit `products.json`
2. Add product object following the schema
3. Ensure images are accessible URLs
4. Use sequential IDs

### Payment Methods

Currently configured for:
- **M-Pesa** (mobile money)
- **Cash on Delivery**

To add new methods, update:
- Payment selector in `cart.html`
- Checkout logic in `assets/js/main.js`

### Delivery Areas

Currently configured for Nairobi only (24–48hrs). To expand:
- Update delivery info in `product.html`
- Update shipping options in `cart.html`
- Add areas to checkout form

## Limitations & Future Enhancements

### Current Limitations
- Product images from Unsplash (placeholders - replace with your own)
- No real payment gateway integration (M-Pesa/Cash placeholders)
- No user accounts (guest checkout only)
- Admin auth via simple password (use Supabase Auth for production)

### Recommended Enhancements
- 🔄 Stripe/M-Pesa Daraja API integration for real payments
- 👤 User registration & login with Supabase Auth
- 💖 Wishlist functionality
- ⭐ Product reviews & ratings system
- 📦 Inventory management
- 📧 Email notifications for orders
- 📍 Order tracking system
- 💰 Discount codes & coupons
- 🌍 Multi-language support
- 📱 PWA capabilities for mobile app experience
- 🔍 Advanced search with Algolia or similar
- 📊 Analytics dashboard

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions:
- Open an issue on GitHub
- Email: faithandfashionnairobi@gmail.com

---

**Built with ❤️ for Faith & Fashion Nairobi**

## What Changed

### Initial Build (v1.0)
- ✅ Complete product catalog (28 products across 4 categories)
- ✅ Advanced product filtering (category, price, size, availability)
- ✅ Full-text search functionality
- ✅ Multiple sorting options
- ✅ Product Detail Pages with image galleries
- ✅ Shopping cart with localStorage persistence
- ✅ Complete checkout flow (customer info, payment, confirmation)
- ✅ Admin dashboard for product & order management
- ✅ Enhanced homepage with hero, categories, best sellers
- ✅ Trust sections (delivery, returns, policies)
- ✅ Contact forms
- ✅ SEO optimization (meta tags, OG tags, JSON-LD)
- ✅ Accessibility features (ARIA, keyboard nav, focus states)
- ✅ Performance optimizations (lazy loading, efficient code)
- ✅ Fully responsive design (mobile-first)
- ✅ Modern UI/UX with consistent design system

## Technology Choices

**Vanilla HTML/CSS/JS** vs Frameworks:
- ✅ No build step required - works directly from file system
- ✅ No npm/node dependencies - lighter and simpler
- ✅ Faster initial load - no framework overhead
- ✅ Easier to deploy - just static files
- ✅ Better for learning and understanding fundamentals
- ✅ Still achieves modern, professional results

**Supabase** for Backend:
- ✅ Free tier generous for small/medium sites
- ✅ Real-time database capabilities
- ✅ Built-in authentication
- ✅ File storage for product images
- ✅ Edge Functions for secure server-side logic
- ✅ SQL database with advanced features

**Vercel** for Deployment:
- ✅ Free tier available
- ✅ Instant deployments from GitHub
- ✅ Global CDN for fast delivery
- ✅ Serverless Functions support
- ✅ Preview deployments for testing
