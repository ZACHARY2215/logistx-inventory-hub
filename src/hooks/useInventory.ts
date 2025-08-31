import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { InventoryItem, Category, Supplier } from '@/types/inventory';

// Demo data for when database is not accessible
const getDemoItems = (): InventoryItem[] => [
  {
    id: 'demo-1',
    name: 'MacBook Pro 14"',
    sku: 'APPLE-MBP14-001',
    category_id: 'demo-cat-1',
    supplier_id: 'demo-sup-1',
    quantity: 25,
    min_quantity: 5,
    price: 1999.99,
    description: 'Professional laptop for development and design work',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getDemoCategories = (): Category[] => [
  { 
    id: 'demo-cat-1', 
    name: 'Electronics', 
    description: 'Electronic devices and components',
    created_at: new Date().toISOString()
  }
];

const getDemoSuppliers = (): Supplier[] => [
  { 
    id: 'demo-sup-1', 
    name: 'Apple Inc.', 
    contact_email: 'business@apple.com', 
    contact_phone: '1-800-APL-CARE', 
    address: 'Cupertino, CA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:categories(name),
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database fetch failed, using demo data:', error);
        setItems(getDemoItems());
        return;
      }
      setItems((data as any) || getDemoItems());
    } catch (error: unknown) {
      console.warn('Database connection failed, using demo data:', error);
      setItems(getDemoItems());
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Categories fetch failed, using demo data:', error);
        setCategories(getDemoCategories());
        return;
      }
      setCategories(data || getDemoCategories());
    } catch (error: unknown) {
      console.warn('Categories connection failed, using demo data:', error);
      setCategories(getDemoCategories());
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Suppliers fetch failed, using demo data:', error);
        setSuppliers(getDemoSuppliers());
        return;
      }
      setSuppliers(data || getDemoSuppliers());
    } catch (error: unknown) {
      console.warn('Suppliers connection failed, using demo data:', error);
      setSuppliers(getDemoSuppliers());
    }
  };

  const addItem = async (item: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          name: item.name,
          sku: item.sku,
          category_id: item.category_id,
          supplier_id: item.supplier_id,
          quantity: item.quantity,
          min_quantity: item.min_quantity,
          price: item.price,
          description: item.description
        }])
        .select();

      if (error) throw error;

      // Create transaction record for new item
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data && data[0]) {
        await supabase.from('inventory_transactions').insert({
          item_id: data[0].id,
          user_id: user.id,
          transaction_type: 'create',
          quantity_change: 0,
          previous_quantity: 0,
          new_quantity: item.quantity,
          notes: `New item created with initial quantity of ${item.quantity}`
        });
      }
      
      toast.success('Item added successfully!');
      await fetchItems();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateItem = async (id: string, updates: any) => {
    try {
      // Get current item to track quantity changes
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) throw new Error('Item not found');

      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Create transaction record for quantity changes
      if (updates.quantity !== undefined && updates.quantity !== currentItem.quantity) {
        const quantityChange = updates.quantity - currentItem.quantity;
        const transactionType = quantityChange > 0 ? 'add' : 'remove';
        
        // Get current user ID from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('inventory_transactions').insert({
            item_id: id,
            user_id: user.id,
            transaction_type: transactionType,
            quantity_change: Math.abs(quantityChange),
            previous_quantity: currentItem.quantity,
            new_quantity: updates.quantity,
            notes: `Quantity ${transactionType === 'add' ? 'increased' : 'decreased'} from ${currentItem.quantity} to ${updates.quantity}`
          });
        }
      }
      
      toast.success('Item updated successfully!');
      await fetchItems();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Get current item to track deletion
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) throw new Error('Item not found');

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create transaction record for deleted item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('inventory_transactions').insert({
          item_id: id,
          user_id: user.id,
          transaction_type: 'delete',
          quantity_change: 0,
          previous_quantity: currentItem.quantity,
          new_quantity: 0,
          notes: `Item deleted from inventory`
        });
      }
      
      toast.success('Item deleted successfully!');
      await fetchItems();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Database connection timeout, using demo data');
        setItems(getDemoItems());
        setCategories(getDemoCategories());
        setSuppliers(getDemoSuppliers());
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        await Promise.all([
          fetchItems(),
          fetchCategories(),
          fetchSuppliers()
        ]);
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Data loading failed, using demo data:', error);
        setItems(getDemoItems());
        setCategories(getDemoCategories());
        setSuppliers(getDemoSuppliers());
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const itemsSubscription = supabase
      .channel('inventory_items')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory_items' },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
    };
  }, []);

  const lowStockItems = items.filter(item => item.quantity <= item.min_quantity);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return {
    items,
    categories,
    suppliers,
    loading,
    lowStockItems,
    totalValue,
    addItem,
    updateItem,
    deleteItem,
    refreshData: () => {
      fetchItems();
      fetchCategories();
      fetchSuppliers();
    }
  };
};