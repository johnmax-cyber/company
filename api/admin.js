// Admin API handler with authentication
const { createClient } = require('@supabase/supabase-js');

// Middleware to verify Supabase JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Check if user has admin role (you would need to implement role checking based on your setup)
    // For now, we'll allow any authenticated user to access admin endpoints
    // In production, you'd check user.role or user.app_metadata.role
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
  }
};

// Rate limiting middleware (basic implementation)
const rateLimit = (() => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 30; // max 30 requests per minute
  
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const ipRequests = requests.get(ip);
    // Remove old requests outside the window
    const validRequests = ipRequests.filter(timestamp => now - timestamp < WINDOW_MS);
    
    if (validRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    
    validRequests.push(now);
    requests.set(ip, validRequests);
    
    next();
  };
})();

module.exports = async function handler(req, res) {
  // Apply rate limiting
  rateLimit(req, res, () => {
    // Set CORS headers (more restrictive)
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://faithandfashionnairobi.vercel.app' 
      : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Authenticate the request
    authenticate(req, res, async () => {
      const url = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
      if (!url || !serviceKey) {
        return res.status(500).json({ error: 'Server configuration error' });
      }
    
      const supabase = createClient(url, serviceKey);
    
      const action = req.query.action;
    
      try {
        switch (action) {
          case 'getProducts': {
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .order('id');
            if (error) throw error;
            return res.json({ data });
          }
    
          case 'getOrders': {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return res.json({ data });
          }
    
          case 'addProduct': {
            const body = req.body;
            
            // Input validation
            if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
              return res.status(400).json({ error: 'Invalid name' });
            }
            if (typeof body.price !== 'number' || body.price <= 0) {
              return res.status(400).json({ error: 'Invalid price' });
            }
            if (!body.category || !['clothes', 'books'].includes(body.category)) {
              return res.status(400).json({ error: 'Invalid category' });
            }
            // Add more validation as needed
    
            const { error } = await supabase
              .from('products')
              .insert([{
                name: body.name.trim(),
                price: body.price,
                category: body.category,
                subcategory: body.subcategory || null,
                description: body.description || null,
                image_url: body.image_url || null,
                in_stock: body.in_stock !== undefined ? body.in_stock : true,
                icon: body.icon || null
              }]);
            
            if (error) throw error;
            return res.json({ success: true, message: 'Product added successfully' });
          }
    
          case 'updateProduct': {
            const body = req.body;
            
            if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
              return res.status(400).json({ error: 'Invalid id' });
            }
            
            // Build update object with only provided fields
            const updateData = {};
            if (body.name !== undefined) {
              if (typeof body.name !== 'string' || !body.name.trim()) {
                return res.status(400).json({ error: 'Invalid name' });
              }
              updateData.name = body.name.trim();
            }
            if (body.price !== undefined) {
              if (typeof body.price !== 'number' || body.price <= 0) {
                return res.status(400).json({ error: 'Invalid price' });
              }
              updateData.price = body.price;
            }
            if (body.category !== undefined) {
              if (!['clothes', 'books'].includes(body.category)) {
                return res.status(400).json({ error: 'Invalid category' });
              }
              updateData.category = body.category;
            }
            if (body.subcategory !== undefined) {
              updateData.subcategory = body.subcategory;
            }
            if (body.description !== undefined) {
              updateData.description = body.description;
            }
            if (body.image_url !== undefined) {
              updateData.image_url = body.image_url;
            }
            if (body.in_stock !== undefined) {
              updateData.in_stock = body.in_stock;
            }
            if (body.icon !== undefined) {
              updateData.icon = body.icon;
            }
            
            // Don't update if no fields provided
            if (Object.keys(updateData).length === 0) {
              return res.status(400).json({ error: 'No valid fields to update' });
            }
    
            const { error } = await supabase
              .from('products')
              .update(updateData)
              .eq('id', body.id);
            
            if (error) throw error;
            return res.json({ success: true, message: 'Product updated successfully' });
          }
    
          case 'deleteProduct': {
            const body = req.body;
            
            if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
              return res.status(400).json({ error: 'Invalid id' });
            }
    
            const { error } = await supabase
              .from('products')
              .delete()
              .eq('id', body.id);
            
            if (error) throw error;
            return res.json({ success: true, message: 'Product deleted successfully' });
          }
    
          case 'updateOrderStatus': {
            const body = req.body;
            
            if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
              return res.status(400).json({ error: 'Invalid id' });
            }
            if (!body.status || !['pending', 'confirmed', 'delivered'].includes(body.status)) {
              return res.status(400).json({ error: 'Invalid status' });
            }
    
            const { error } = await supabase
              .from('orders')
              .update({ status: body.status })
              .eq('id', body.id);
            
            if (error) throw error;
            return res.json({ success: true, message: 'Order status updated successfully' });
          }
    
          default:
            return res.status(400).json({ error: 'Unknown action' });
        }
      } catch (error) {
        console.error('API error:', error);
        // Don't expose internal error details in production
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message;
        return res.status(500).json({ error: errorMessage });
      }
    });
  });
};