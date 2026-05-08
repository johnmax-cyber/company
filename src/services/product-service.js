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
      if (!data || data.length === 0) {
        throw new Error('Supabase returned no products (empty dataset)');
      }
      return data;
    } catch (error) {
      console.warn('Supabase getAllProducts() failed, loading from products.json fallback:', error.message);
      
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.products || !Array.isArray(json.products)) {
          throw new Error('Invalid products.json structure: missing "products" array');
        }
        return json.products;
      } catch (jsonError) {
        console.error('Fallback to products.json also failed:', jsonError);
        return []; // Return empty array as last resort
      }
    }
  },

  // Fetch products with caching (only in-stock items)
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
      if (!data || data.length === 0) {
        throw new Error('Supabase returned no in-stock products');
      }

      // Cache the results
      store.set(CACHE_KEY, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.warn('Supabase getProducts() failed, loading from products.json fallback:', error.message);
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.products || !Array.isArray(json.products)) {
          throw new Error('Invalid products.json structure');
        }
        
        const filtered = json.products.filter(p => p.inStock !== false) || [];
        store.set(CACHE_KEY, { data: filtered, timestamp: Date.now() });
        console.info(`Loaded ${filtered.length} in-stock products from products.json fallback`);
        return filtered;
      } catch (jsonError) {
        console.error('Both Supabase and products.json failed:', jsonError);
        if (cached && cached.data) {
          console.warn('Using stale cache as last resort');
          return cached.data;
        }
        return [];
      }
    }
  },

  // Get product by ID - fallback to JSON
  async getProductById(id) {
    const productId = parseInt(id);
    if (isNaN(productId)) {
      console.error(`Invalid product ID: ${id}`);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error(`Product with ID ${productId} not found in Supabase`);
      }
      return data;
    } catch (error) {
      console.warn(`Supabase getProductById(${productId}) failed, trying JSON fallback:`, error.message);
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.products || !Array.isArray(json.products)) {
          throw new Error('Invalid products.json structure');
        }
        
        const product = json.products.find(p => p.id === productId) || null;
        if (!product) {
          console.warn(`Product ID ${productId} not found in fallback data`);
        }
        return product;
      } catch (jsonError) {
        console.error(`Error loading product ${productId} from fallback:`, jsonError);
        return null;
      }
    }
  },

  // Search products - fallback to JSON
  async searchProducts(query) {
    if (!query || typeof query !== 'string') {
      console.error('Invalid search query:', query);
      return [];
    }

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .ilike('name', `%${trimmedQuery}%`);

      if (error) throw error;
      if (!data || data.length === 0) {
        console.info(`No Supabase results for search: "${query}"`);
      }
      return data || [];
    } catch (error) {
      console.warn(`Supabase searchProducts("${query}") failed, using JSON fallback:`, error.message);
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.products || !Array.isArray(json.products)) {
          throw new Error('Invalid products.json structure');
        }
        
        const results = json.products.filter(p => 
          p.inStock !== false && 
          (p.name && p.name.toLowerCase().includes(trimmedQuery) || 
           p.description && p.description.toLowerCase().includes(trimmedQuery))
        );
        console.info(`Found ${results.length} products matching "${query}" from JSON fallback`);
        return results;
      } catch (jsonError) {
        console.error('Search fallback failed:', jsonError);
        return [];
      }
    }
  },

  // Get products by category - fallback to JSON
  async getProductsByCategory(category, subcategory = null) {
    if (!category || typeof category !== 'string') {
      console.error('Invalid category:', category);
      return [];
    }

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
      if (!data || data.length === 0) {
        console.info(`No Supabase results for category: ${category}${subcategory ? `, subcategory: ${subcategory}` : ''}`);
      }
      return data || [];
    } catch (error) {
      console.warn(`Supabase getProductsByCategory(${category}, ${subcategory}) failed, using JSON fallback:`, error.message);
      
      // Fallback to products.json
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.products || !Array.isArray(json.products)) {
          throw new Error('Invalid products.json structure');
        }
        
        let filtered = json.products.filter(p => 
          p.category === category && p.inStock !== false
        );
        
        if (subcategory && subcategory !== 'all') {
          filtered = filtered.filter(p => p.subcategory === subcategory);
        }
        
        console.info(`Found ${filtered.length} products for category ${category}${subcategory ? `/${subcategory}` : ''} from JSON fallback`);
        return filtered;
      } catch (jsonError) {
        console.error('Category fetch fallback failed:', jsonError);
        return [];
      }
    }
  },

  // Clear product cache
  clearCache() {
    store.remove(CACHE_KEY);
    console.info('Product cache cleared');
  }
};

export default productService;
