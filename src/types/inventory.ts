import { Database } from "@/integrations/supabase/types";

// Database types from Supabase
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  supplier?: Database['public']['Tables']['suppliers']['Row'];
};

export type Category = Database['public']['Tables']['categories']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Insert types for creating new records
export type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type InventoryTransactionInsert = Database['public']['Tables']['inventory_transactions']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

// Update types for updating records
export type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];
export type InventoryTransactionUpdate = Database['public']['Tables']['inventory_transactions']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];