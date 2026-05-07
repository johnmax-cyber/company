// Service for product-related operations
import { supabase } from '../utils/supabase.js';
import { store } from '../utils/storage.js';

const CACHE_KEY = 'faith-fashion-products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const productService = {
  // Fetch all products - fallback to JSON if Supabase unavailable
  async getAllProducts() {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (error) {
      console.warn('Supabase unavailable, loading from products.json');
    }
    
    try {
      const response = await fetch('/products.json');
      if (!response.ok) throw new Error('Failed to load products.json');
      const { products } = await response.json();
      return products || [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  // Fetch products with caching
  async getProducts() {
    // Try to get from cache first
    const cached = store.get(CACHE_KEY);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (error) throw error;

      // Cache the results
      store.set(CACHE_KEY, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        const { products } = await response.json();
        const filtered = products.filter(p => p.inStock !== false) || [];
        store.set(CACHE_KEY, { data: filtered, timestamp: Date.now() });
        return filtered;
      } catch (jsonError) {
        console.error('Error loading from products.json:', jsonError);
        if (cached) return cached.data;
        return [];
      }
    }
  },

  // Get product by ID - fallback to JSON
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase fetch failed for product, trying JSON');
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        const { products } = await response.json();
        return products.find(p => p.id === parseInt(id)) || null;
      } catch (jsonError) {
        console.error(`Error loading product ${id}:`, jsonError);
        return null;
      }
    }
  },

  // Search products - fallback to JSON
  async searchProducts(query) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .ilike('name', `%${query}%`);

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase search failed, trying JSON');
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        const { products } = await response.json();
        const lowerQuery = query.toLowerCase();
        return products.filter(p => 
          p.inStock !== false && 
          (p.name.toLowerCase().includes(lowerQuery) || 
           p.description.toLowerCase().includes(lowerQuery))
        );
      } catch (jsonError) {
        console.error('Error searching products:', jsonError);
        return [];
      }
    }
  },

  // Get products by category - fallback to JSON
  async getProductsByCategory(category, subcategory = null) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .eq('category', category);

      if (subcategory && subcategory !== 'all') {
        query = query.eq('subcategory', subcategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Supabase fetch failed for category, trying JSON');
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Failed to load products.json');
        const { products } = await response.json();
        let filtered = products.filter(p => p.category === category && p.inStock !== false);
        if (subcategory && subcategory !== 'all') {
          filtered = filtered.filter(p => p.subcategory === subcategory);
        }
        return filtered;
      } catch (jsonError) {
        console.error('Error fetching products by category:', jsonError);
        return [];
      }
    }
  },

  // Clear product cache
  clearCache() {
    store.remove(CACHE_KEY);
  }
};

export default productService;