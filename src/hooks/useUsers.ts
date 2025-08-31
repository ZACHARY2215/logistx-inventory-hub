import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

// Demo data for when database is not accessible
const getDemoUsers = (): UserProfile[] => [
  {
    id: 'demo-user-1',
    user_id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@logistx.com',
    name: 'System Administrator',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-user-2',
    user_id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@logistx.com',
    name: 'Inventory Staff',
    role: 'staff',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Users fetch failed, using demo data:', error);
        setUsers(getDemoUsers());
        return;
      }
      // Type cast to handle the string role type from database
      setUsers((data as any) || getDemoUsers());
    } catch (error: unknown) {
      console.warn('Users connection failed, using demo data:', error);
      setUsers(getDemoUsers());
    }
  };

  const addUser = async (user: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([user])
        .select();

      if (error) throw error;
      
      toast.success('User added successfully!');
      await fetchUsers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('User updated successfully!');
      await fetchUsers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('User deleted successfully!');
      await fetchUsers();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Users loading timeout, using demo data');
        setUsers(getDemoUsers());
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        await fetchUsers();
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Users loading failed, using demo data:', error);
        setUsers(getDemoUsers());
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const usersSubscription = supabase
      .channel('profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
    };
  }, []);

  const adminUsers = users.filter(user => user.role === 'admin');
  const staffUsers = users.filter(user => user.role === 'staff');
  const totalUsers = users.length;

  return {
    users,
    adminUsers,
    staffUsers,
    totalUsers,
    loading,
    addUser,
    updateUser,
    deleteUser,
    refreshData: fetchUsers
  };
};