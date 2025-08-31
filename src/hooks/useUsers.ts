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

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
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
    fetchUsers();
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
