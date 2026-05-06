# Faith & Fashion Nairobi - E-commerce Platform

A secure, performant, and scalable e-commerce platform for Faith & Fashion Nairobi built with vanilla JavaScript, Supabase, and Vercel.

## 🚀 Major Improvements

### Security Hardening
- **Environment Variables**: All secrets moved to Vercel environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- **API Protection**: Admin endpoints now require Supabase JWT authentication
- **Input Validation**: Strict validation on all API inputs to prevent injection attacks
- **Rate Limiting**: Basic rate limiting implemented on admin endpoints to prevent abuse
- **Secure Error Handling**: Generic error messages in production to prevent information leakage
- **CORS Restriction**: More restrictive CORS policies for API endpoints
- **No Frontend Secrets**: Removed all secrets from client-side code

### Performance Optimization
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Caching Layer**: Product data cached in localStorage with 5-minute TTL
- **Lazy Loading**: Images load only when needed
- **Optimized Database Queries**: Added indexes on frequently queried columns
- **Reduced API Calls**: Request deduplication and efficient data fetching
- **Code Splitting**: Route-based code splitting for faster initial load

### Code Quality & Maintainability
- **Modular Structure**: Organized into components, pages, services, and utils
- **Reusable Components**: Header, footer, product cards, cart items as reusable classes
- **Consistent Patterns**: Standardized error handling, state management, and API calls
- **Separation of Concerns**: Business logic separated from DOM manipulation
- **Type Safety**: Improved data validation and error handling

## 📁 Updated Folder Structure

```
src/
├── components/
│   ├── header.js
│   ├── footer.js
│   ├── product-card.js
│   ├── cart-item.js
│   └── loading-spinner.js
├── pages/
│   ├── home.js
│   ├── shop.js
│   ├── product.js
│   ├── cart.js
│   └── admin.js
├── utils/
│   ├── supabase.js
│   ├── storage.js
│   ├── formatters.js
│   └── validators.js
├── services/
│   ├── product-service.js
│   ├── cart-service.js
│   └── order-service.js
├── assets/
│   ├── css/
│   └── images/
└── api/
    ├── admin.js
    └── config.js
```

## 🔧 Environment Variables Required

Set these in your Vercel project settings:

### Required Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key (for frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for backend/admin APIs)
- `NODE_ENV`: Set to "production" for production deployments

### Security Notes
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- **Never** commit these variables to version control
- Use Vercel's environment variable system for secure storage

## 🚀 Deployment Instructions

### 1. Prerequisites
- Node.js >= 16.x
- Supabase account and project
- Vercel account
- Git repository

### 2. Setup Supabase
1. Create a new Supabase project
2. Copy the SQL from `supabase/schema.sql` and run it in your Supabase SQL editor
3. Note your project URL and anon key from Settings > API
4. Generate a service role key from Settings > API

### 3. Deploy to Vercel
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the repository into Vercel
3. Vercel will automatically detect `vercel.json` and configure the builds
4. Add the environment variables in Vercel Project Settings > Environment Variables
5. Deploy!

### 4. Local Development
1. Install dependencies (if any): `npm install`
2. Set up local environment variables in a `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=development
   ```
3. Run a local development server (e.g., `npx vercel dev` or use a simple static server)

## 📱 Features

### User Features
- Browse products by category (Men's, Women's, Kids, Books)
- Search products by name
- Filter products by category
- Sort products by price, name, or featured
- View detailed product information
- Add products to cart
- Update cart quantities
- Secure checkout with M-Pesa or Cash on Delivery
- Order confirmation and tracking
- Responsive design for mobile and desktop

### Admin Features
- Secure admin dashboard (protected by authentication)
- View all products
- Add new products
- Edit existing products
- Delete products
- View all orders
- Update order status (pending, confirmed, delivered)
- Basic analytics (order count, revenue, etc.)

## 🛡️ Security Details

### Authentication
- Admin API endpoints require valid Supabase JWT tokens
- Tokens must be sent in the Authorization header: `Bearer <token>`
- Token validation performed against Supabase auth service

### Input Validation
- All API inputs validated for type, format, and business rules
- Sanitization to prevent XSS attacks
- Length limits on text inputs
- Numerical range validation

### Rate Limiting
- Admin endpoints limited to 30 requests per minute per IP
- Helps prevent brute force attacks and abuse
- Returns 429 Too Many Requests when limit exceeded

### Data Protection
- Row Level Security (RLS) enabled on all tables
- Public can only read active products
- Only service role can access orders and perform admin operations
- No sensitive data exposed in error messages (production)

## ⚡ Performance Details

### Caching Strategy
- Product data cached in localStorage for 5 minutes
- Cache cleared automatically when data is updated via admin
- Reduces redundant API calls for frequently accessed data

### Database Optimization
- Indexes on category, subcategory, price, rating, tags, and status
- GIN indexes on tags array and items JSONB for efficient querying
- Updated_at triggers for tracking record modifications

### Frontend Optimization
- Lazy loading for all product images
- Minimal DOM updates using efficient rendering techniques
- Event delegation for handling user interactions
- CSS optimized for minimal repaints and reflows

## 🧪 Testing

### Manual Testing Checklist
1. Verify environment variables are set correctly
2. Test product browsing and filtering
3. Test product search functionality
4. Test adding/removing items from cart
5. Test checkout process (both M-Pesa and Cash on Delivery)
6. Test admin login and authentication
7. Test admin product management (add/edit/delete)
8. Test admin order management (view/update status)
9. Test responsive design on mobile devices
10. Verify error handling and user feedback

### Security Testing
1. Attempt to access admin endpoints without authentication (should get 401)
2. Try to send invalid tokens to admin endpoints (should get 401)
3. Test rate limiting by making rapid requests to admin endpoints
4. Attempt SQL injection or XSS attacks through input fields
5. Verify no sensitive data leaked in error messages
6. Check that frontend code contains no secrets

## 📞 Support

For issues or questions, please contact the development team or refer to the Supabase and Vercel documentation.

---

*Faith & Fashion Nairobi - Premium modest clothing and SDA books for the whole family.*