# Company Shop

Multi-page e-commerce website for clothes and books.

## Tech Stack
- HTML/CSS/JS
- Supabase (Backend)
- Vercel (Deployment)

## Deployment

### GitHub Push
```bash
git init
git add -A
git commit -m "Company shop website"
git remote add origin https://github.com/YOUR_USERNAME/company.git
git push -u origin main
```

### Vercel Deploy
1. Import GitHub repo at vercel.com
2. Add environment variables:
   - `SUPABASE_URL` = `https://lldckqllbljogqbidbpp.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZGNrcWxsYmxqb2dxYmlkYnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTM1NTYsImV4cCI6MjA2MjE4OTU1Nn0.sb_publishable_zcqkR4_8oHbjjZbhMDpl3A_uMMg6UYo`
3. Deploy

## Pages
- `/pages/index.html` - Home
- `/pages/shop.html` - Shop
- `/pages/product.html` - Product Detail
- `/pages/cart.html` - Cart
- `/pages/contact.html` - Contact
- `/pages/admin.html` - Admin (password: admin123)

## Supabase Setup
Run `supabase/schema.sql` in Supabase SQL Editor to create tables.