// SETUP REQUIRED: Add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.
// Get it from: Supabase Dashboard → Project Settings → API → service_role key
// NEVER commit this key to GitHub or put it in config.js

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
        const { data, error } = await supabase.from('products').select('*').order('id');
        if (error) throw error;
        return res.json({ data });
      }

      case 'getOrders': {
        const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
        if (error) throw error;
        return res.json({ data });
      }

      case 'addProduct': {
        const body = req.body;
        if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
          return res.status(400).json({ error: 'Invalid name' });
        }
        if (typeof body.price !== 'number' || body.price <= 0) {
          return res.status(400).json({ error: 'Invalid price' });
        }
        const { error } = await supabase.from('products').insert([body]);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'updateProduct': {
        const body = req.body;
        if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const { id, ...updateData } = body;
        const { error } = await supabase.from('products').update(updateData).eq('id', id);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'deleteProduct': {
        const body = req.body;
        if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const { error } = await supabase.from('products').delete().eq('id', body.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'updateOrderStatus': {
        const body = req.body;
        if (!body.id || typeof body.id !== 'number' || body.id <= 0) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        if (!body.status || !['pending', 'confirmed', 'delivered'].includes(body.status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        const { error } = await supabase.from('orders').update({ status: body.status }).eq('id', body.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};