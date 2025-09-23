import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Supplier, SupplierInsert, SupplierUpdate } from '@/types/inventory';

// Demo data for when database is not accessible
const getDemoSuppliers = (): Supplier[] => [
  { 
    id: 'demo-sup-1', 
    name: 'Apple Inc.', 
    contact_email: 'business@apple.com', 
    contact_phone: '+1-800-APL-CARE', 
    address: 'One Apple Park Way, Cupertino, CA 95014, USA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'demo-sup-2', 
    name: 'Microsoft Corporation', 
    contact_email: 'sales@microsoft.com', 
    contact_phone: '+1-800-MICROSOFT', 
    address: 'One Microsoft Way, Redmond, WA 98052, USA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'demo-sup-3', 
    name: 'Dell Technologies', 
    contact_email: 'support@dell.com', 
    contact_phone: '+1-800-DELL', 
    address: 'One Dell Way, Round Rock, TX 78682, USA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addSupplier = async (supplier: SupplierInsert) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select();

      if (error) throw error;

      toast.success('Supplier added successfully!');
      await fetchSuppliers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add supplier';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateSupplier = async (id: string, updates: SupplierUpdate) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Supplier updated successfully!');
      await fetchSuppliers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update supplier';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Supplier deleted successfully!');
      await fetchSuppliers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete supplier';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Database connection timeout, using demo data');
        setSuppliers(getDemoSuppliers());
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        await fetchSuppliers();
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Suppliers loading failed, using demo data:', error);
        setSuppliers(getDemoSuppliers());
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const suppliersSubscription = supabase
      .channel('suppliers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'suppliers' },
        () => fetchSuppliers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(suppliersSubscription);
    };
  }, []);

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    refreshSuppliers: fetchSuppliers
  };
};