// Service for order-related operations
import { supabase } from '../utils/supabase.js';

export const orderService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  },

  // Get orders (admin only - should be called from secure backend)
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }
};

export default orderService;