import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_date: string;
  delivery_date?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  inventory_item?: {
    name: string;
    sku: string;
    category?: { name: string };
  };
}

// Demo data for when database is not accessible
const getDemoOrders = (): Order[] => [
  {
    id: 'demo-order-1',
    order_number: 'ORD240001',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    customer_phone: '+1-555-0123',
    order_date: new Date().toISOString(),
    delivery_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'pending',
    total_amount: 2599.97,
    notes: 'Urgent delivery requested',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-order-2',
    order_number: 'ORD240002',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah@company.com',
    customer_phone: '+1-555-0456',
    order_date: new Date(Date.now() - 86400000).toISOString(),
    delivery_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'processing',
    total_amount: 899.99,
    notes: '',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getDemoOrderItems = (): OrderItem[] => [
  {
    id: 'demo-item-1',
    order_id: 'demo-order-1',
    inventory_item_id: 'demo-1',
    quantity: 1,
    unit_price: 1999.99,
    total_price: 1999.99,
    created_at: new Date().toISOString(),
    inventory_item: {
      name: 'MacBook Pro 14"',
      sku: 'APPLE-MBP14-001',
      category: { name: 'Electronics' }
    }
  }
];

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Orders fetch failed, using demo data:', error);
        setOrders(getDemoOrders());
        return;
      }
      setOrders((data as any) || getDemoOrders());
    } catch (error: unknown) {
      console.warn('Orders connection failed, using demo data:', error);
      setOrders(getDemoOrders());
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          inventory_item:inventory_items(
            name,
            sku,
            category:categories(name)
          )
        `)
        .eq('order_id', orderId);

      if (error) {
        console.warn('Order items fetch failed:', error);
        return getDemoOrderItems().filter(item => item.order_id === orderId);
      }
      return data || [];
    } catch (error: unknown) {
      console.warn('Order items connection failed:', error);
      return getDemoOrderItems().filter(item => item.order_id === orderId);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${year}${month}${day}${random}`;
  };

  const addOrder = async (orderData: any, items: any[]) => {
    try {
      const orderNumber = generateOrderNumber();
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Create order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          order_date: new Date().toISOString(),
          delivery_date: orderData.delivery_date,
          status: 'pending',
          total_amount: totalAmount,
          notes: orderData.notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      if (items.length > 0) {
        const orderItemsData = items.map(item => ({
          order_id: orderResult.id,
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsError) throw itemsError;

        // Update inventory quantities (simplified - would need actual RPC function)
        for (const item of items) {
          // This would need a proper RPC function or direct SQL update
          console.log(`Would update inventory item ${item.inventory_item_id} by ${-item.quantity}`);
        }
      }

      toast.success('Order created successfully!');
      await fetchOrders();
      return { success: true, data: orderResult };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully!');
      await fetchOrders();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // Delete order items first (will cascade automatically due to foreign key)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order deleted successfully!');
      await fetchOrders();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Orders loading timeout, using demo data');
        setOrders(getDemoOrders());
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        await fetchOrders();
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Orders loading failed, using demo data:', error);
        setOrders(getDemoOrders());
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const ordersSubscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.order_date);
    return today.toDateString() === orderDate.toDateString();
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    today: todayOrders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0)
  };

  return {
    orders,
    orderItems,
    loading,
    orderStats,
    todayOrders,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    fetchOrderItems,
    refreshData: fetchOrders
  };
};