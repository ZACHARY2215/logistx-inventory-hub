-- Fix RLS policies to allow data insertion and viewing
-- This script makes the tables accessible for demo purposes

-- Disable RLS temporarily for seeding
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with more permissive policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can delete suppliers" ON public.suppliers;

DROP POLICY IF EXISTS "Authenticated users can view inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can insert inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can update inventory quantities" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can delete inventory items" ON public.inventory_items;

DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.inventory_transactions;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create more permissive policies for demo purposes
CREATE POLICY "Allow all operations on categories" ON public.categories
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on suppliers" ON public.suppliers
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on profiles" ON public.profiles
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on inventory_transactions" ON public.inventory_transactions
FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.categories TO anon;
GRANT ALL ON public.suppliers TO anon;
GRANT ALL ON public.inventory_items TO anon;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.inventory_transactions TO anon;

GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.suppliers TO authenticated;
GRANT ALL ON public.inventory_items TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.inventory_transactions TO authenticated;
