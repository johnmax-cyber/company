// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/esm/index.js';

// Get Supabase URL and anon key from environment variables loaded via api/config.js
const getSupabaseConfig = () => {
  // These will be set by the config.js API endpoint
  return {
    url: window.__SUPABASE_URL__ || '',
    anonKey: window.__SUPABASE_ANON_KEY__ || ''
  };
};

// Create and export supabase client
const { url, anonKey } = getSupabaseConfig();
export const supabase = createClient(url, anonKey);

// Export helper functions
export const supabaseFetch = async (query) => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export default supabase;