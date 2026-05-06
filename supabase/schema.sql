-- Supabase Database Schema for Faith & Fashion Nairobi
-- Optimized with indexes and improved security

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  icon TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample products
INSERT INTO products (name, price, category, subcategory, description, in_stock, icon, rating, reviews_count, tags) VALUES
('Classic Dress Shirt', 39.99, 'clothes', 'men', 'Comfortable and stylish dress shirt perfect for formal occasions.', true, '👔', 4.5, 120, '{New,Sale}'),
('Slim Fit Jeans', 49.99, 'clothes', 'men', 'Modern slim fit jeans with premium fabric.', true, '👖', 4.2, 89, '{New}'),
('Wool Blazer', 89.99, 'clothes', 'men', 'Elegant wool blazer for professional wear.', true, '🧥', 4.8, 45, '{}'),
('Casual Polo', 29.99, 'clothes', 'men', 'Relaxed cotton polo for everyday comfort.', true, '👕', 4.0, 203, '{}'),
('Summer Dress', 59.99, 'clothes', 'women', 'Light and breezy summer dress.', true, '👗', 4.6, 156, '{New}'),
('Blouse Top', 34.99, 'clothes', 'women', 'Versatile blouse for work or play.', true, '👚', 4.3, 78, '{}'),
('Maxi Skirt', 44.99, 'clothes', 'women', 'Flowing maxi skirt with beautiful design.', true, '👘', 4.4, 67, '{Sale}'),
('Cardigan', 54.99, 'clothes', 'women', 'Cozy cardigan for layering.', true, '🧶', 4.1, 112, '{}'),
('Kids T-Shirt', 19.99, 'clothes', 'children', 'Soft cotton t-shirt for kids.', true, '👕', 4.7, 234, '{New}'),
('Kids Jeans', 34.99, 'clothes', 'children', 'Durable jeans for active kids.', true, '👖', 4.2, 98, '{}'),
('Kids Hoodie', 39.99, 'clothes', 'children', 'Warm hoodie for cold days.', true, '🧥', 4.5, 76, '{}'),
('Kids Sneakers', 44.99, 'clothes', 'children', 'Comfortable sneakers for kids.', true, '👟', 4.6, 145, '{New}'),
('The Great Adventure', 14.99, 'books', 'fiction', 'An exciting adventure story for all ages.', true, '📖', 4.8, 234, '{}'),
('Mystery at Midnight', 12.99, 'books', 'fiction', 'A thrilling mystery novel.', true, '📕', 4.5, 167, '{New}'),
('Love in Paris', 9.99, 'books', 'fiction', 'A romantic story set in Paris.', true, '💕', 4.7, 89, '{}'),
('Science Textbook', 79.99, 'books', 'textbooks', 'Comprehensive science reference.', true, '📚', 4.9, 56, '{}'),
('Math Fundamentals', 59.99, 'books', 'textbooks', 'Essential math guide.', true, '➕', 4.8, 112, '{}'),
('History of Art', 45.99, 'books', 'textbooks', 'Explore the history of art.', true, '🎨', 4.6, 78, '{}'),
('Bedtime Stories', 12.99, 'books', 'childrens', 'Sweet bedtime stories for kids.', true, '📖', 4.9, 189, '{New}'),
('ABC Learning', 9.99, 'books', 'childrens', 'Learn the alphabet fun way.', true, '🔤', 4.7, 156, '{}'),
('Coloring Fun', 7.99, 'books', 'childrens', 'Coloring book with many pictures.', true, '🖍️', 4.8, 201, '{New}'),
('Animal Kingdom', 11.99, 'books', 'childrens', 'Learn about animals.', true, '🦁', 4.9, 134, '{}');

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'cash')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_subcategory ON products(subcategory);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);
CREATE INDEX idx_items_gin ON orders USING GIN(items);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products (only active ones)
CREATE POLICY "Products are viewable by everyone" ON products 
FOR SELECT 
USING (in_stock = true);

-- Allow insert access to orders (anon can insert)
CREATE POLICY "Anyone can create orders" ON orders 
FOR INSERT 
WITH CHECK (true);

-- Allow insert access to messages
CREATE POLICY "Anyone can send messages" ON messages 
FOR INSERT 
WITH CHECK (true);

-- Prevent public from reading all orders (only allow via service role / admin)
CREATE POLICY "Orders not publicly readable" ON orders 
FOR SELECT 
USING (false);

-- Prevent public from updating orders
CREATE POLICY "Orders not publicly updatable" ON orders 
FOR UPDATE 
USING (false);

-- Prevent public from deleting orders  
CREATE POLICY "Orders not publicly deletable" ON orders 
FOR DELETE 
USING (false);

-- Prevent public from deleting products
CREATE POLICY "Products not publicly deletable" ON products 
FOR DELETE 
USING (false);

-- Prevent public from inserting products
CREATE POLICY "Products not publicly insertable" ON products 
FOR INSERT 
WITH CHECK (false);

-- Prevent public from updating products
CREATE POLICY "Products not publicly updatable" ON products 
FOR UPDATE 
USING (false);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();