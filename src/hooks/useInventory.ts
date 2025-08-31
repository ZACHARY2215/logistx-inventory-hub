import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  supplier_id: string;
  quantity: number;
  min_quantity: number;
  price: number;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: { name: string };
  supplier?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

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

      if (error) throw error;
      setItems(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch inventory items');
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', error);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
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
      
      toast.success('Item added successfully!');
      await fetchItems();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
      await Promise.all([
        fetchItems(),
        fetchCategories(),
        fetchSuppliers()
      ]);
      setLoading(false);
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