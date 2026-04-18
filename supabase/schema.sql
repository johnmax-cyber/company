-- Supabase Database Schema for Company Shop

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
  icon TEXT
);

-- Insert sample products
INSERT INTO products (name, price, category, subcategory, description, in_stock, icon) VALUES
('Classic Dress Shirt', 39.99, 'clothes', 'men', 'Comfortable and stylish dress shirt perfect for formal occasions.', true, '👔'),
('Slim Fit Jeans', 49.99, 'clothes', 'men', 'Modern slim fit jeans with premium fabric.', true, '👖'),
('Wool Blazer', 89.99, 'clothes', 'men', 'Elegant wool blazer for professional wear.', true, '🧥'),
('Casual Polo', 29.99, 'clothes', 'men', 'Relaxed cotton polo for everyday comfort.', true, '👕'),
('Summer Dress', 59.99, 'clothes', 'women', 'Light and breezy summer dress.', true, '👗'),
('Blouse Top', 34.99, 'clothes', 'women', 'Versatile blouse for work or play.', true, '👚'),
('Maxi Skirt', 44.99, 'clothes', 'women', 'Flowing maxi skirt with beautiful design.', true, '👘'),
('Cardigan', 54.99, 'clothes', 'women', 'Cozy cardigan for layering.', true, '🧶'),
('Kids T-Shirt', 19.99, 'clothes', 'children', 'Soft cotton t-shirt for kids.', true, '👕'),
('Kids Jeans', 34.99, 'clothes', 'children', 'Durable jeans for active kids.', true, '👖'),
('Kids Hoodie', 39.99, 'clothes', 'children', 'Warm hoodie for cold days.', true, '🧥'),
('Kids Sneakers', 44.99, 'clothes', 'children', 'Comfortable sneakers for kids.', true, '👟'),
('The Great Adventure', 14.99, 'books', 'fiction', 'An exciting adventure story for all ages.', true, '📖'),
('Mystery at Midnight', 12.99, 'books', 'fiction', 'A thrilling mystery novel.', true, '📕'),
('Love in Paris', 9.99, 'books', 'fiction', 'A romantic story set in Paris.', true, '💕'),
('Science Textbook', 79.99, 'books', 'textbooks', 'Comprehensive science reference.', true, '📚'),
('Math Fundamentals', 59.99, 'books', 'textbooks', 'Essential math guide.', true, '➕'),
('History of Art', 45.99, 'books', 'textbooks', 'Explore the history of art.', true, '🎨'),
('Bedtime Stories', 12.99, 'books', 'childrens', 'Sweet bedtime stories for kids.', true, '📖'),
('ABC Learning', 9.99, 'books', 'childrens', 'Learn the alphabet fun way.', true, '🔤'),
('Coloring Fun', 7.99, 'books', 'childrens', 'Coloring book with many pictures.', true, '🖍️'),
('Animal Kingdom', 11.99, 'books', 'childrens', 'Learn about animals.', true, '🦁');

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'cash')),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Allow insert access to orders (anon can insert)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

-- Allow insert access to messages
CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true);