// Service for product-related operations
import { supabase } from '../utils/supabase.js';
import { store } from '../utils/storage.js';

const CACHE_KEY = 'faith-fashion-products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const productService = {
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
      console.error('Error fetching products:', error);
      
      // Fallback to cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      // Return empty array if no data available
      return [];
    }
  },

  // Get product by ID
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
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },

  // Search products
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
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get products by category
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
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Clear product cache
  clearCache() {
    store.remove(CACHE_KEY);
  }
};

export default productService;