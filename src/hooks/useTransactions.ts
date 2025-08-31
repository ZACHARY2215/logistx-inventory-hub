import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryTransaction {
  id: string;
  item_id: string;
  user_id: string;
  transaction_type: 'add' | 'remove' | 'adjust' | 'create' | 'update' | 'delete';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  notes?: string;
  created_at: string;
  // Joined data
  item?: { name: string; sku: string };
  user?: { name: string; email: string };
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:inventory_items(name, sku),
          user:profiles(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
    }
  };

  const addTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert([transaction])
        .select();

      if (error) throw error;
      
      await fetchTransactions();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const transactionsSubscription = supabase
      .channel('inventory_transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory_transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsSubscription);
    };
  }, []);

  const recentTransactions = transactions.slice(0, 10);
  const todayTransactions = transactions.filter(t => {
    const today = new Date();
    const transactionDate = new Date(t.created_at);
    return today.toDateString() === transactionDate.toDateString();
  });

  const transactionStats = {
    total: transactions.length,
    today: todayTransactions.length,
    adds: transactions.filter(t => t.transaction_type === 'add').length,
    removes: transactions.filter(t => t.transaction_type === 'remove').length,
    adjustments: transactions.filter(t => t.transaction_type === 'adjust').length
  };

  return {
    transactions,
    recentTransactions,
    todayTransactions,
    transactionStats,
    loading,
    addTransaction,
    refreshData: fetchTransactions
  };
};
