-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transactions table for audit trail
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'remove', 'adjust', 'create', 'update', 'delete')),
  quantity_change INTEGER NOT NULL DEFAULT 0,
  previous_quantity INTEGER NOT NULL DEFAULT 0,
  new_quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for suppliers (only authenticated users)
CREATE POLICY "Authenticated users can view suppliers" 
ON public.suppliers FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Admins can insert suppliers" 
ON public.suppliers FOR INSERT 
TO authenticated WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update suppliers" 
ON public.suppliers FOR UPDATE 
TO authenticated USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete suppliers" 
ON public.suppliers FOR DELETE 
TO authenticated USING (public.get_current_user_role() = 'admin');

-- RLS Policies for categories (only authenticated users)
CREATE POLICY "Authenticated users can view categories" 
ON public.categories FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories FOR INSERT 
TO authenticated WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update categories" 
ON public.categories FOR UPDATE 
TO authenticated USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete categories" 
ON public.categories FOR DELETE 
TO authenticated USING (public.get_current_user_role() = 'admin');

-- RLS Policies for inventory_items (only authenticated users)
CREATE POLICY "Authenticated users can view inventory items" 
ON public.inventory_items FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Admins can insert inventory items" 
ON public.inventory_items FOR INSERT 
TO authenticated WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Staff can update inventory quantities" 
ON public.inventory_items FOR UPDATE 
TO authenticated USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admins can delete inventory items" 
ON public.inventory_items FOR DELETE 
TO authenticated USING (public.get_current_user_role() = 'admin');

-- RLS Policies for inventory_transactions (only authenticated users)
CREATE POLICY "Authenticated users can view transactions" 
ON public.inventory_transactions FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert transactions" 
ON public.inventory_transactions FOR INSERT 
TO authenticated WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'staff')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and components'),
  ('Furniture', 'Office and workspace furniture'),
  ('Computer Accessories', 'Computer peripherals and accessories'),
  ('Office Equipment', 'General office equipment'),
  ('Appliances', 'Kitchen and office appliances'),
  ('Accessories', 'General accessories and supplies');

-- Insert default suppliers
INSERT INTO public.suppliers (name, contact_email, contact_phone, address) VALUES
  ('Apple Inc.', 'business@apple.com', '1-800-APL-CARE', 'Cupertino, CA'),
  ('Herman Miller', 'sales@hermanmiller.com', '1-800-646-4400', 'Zeeland, MI'),
  ('Logitech', 'business@logitech.com', '1-646-454-3200', 'Newark, CA'),
  ('IKEA', 'business@ikea.com', '1-888-888-4532', 'Conshohocken, PA'),
  ('Dell', 'sales@dell.com', '1-800-915-3355', 'Round Rock, TX'),
  ('Corsair', 'business@corsair.com', '1-888-222-4346', 'Fremont, CA'),
  ('Breville', 'sales@breville.com', '1-866-273-8455', 'Sydney, Australia'),
  ('HP', 'business@hp.com', '1-800-474-6836', 'Palo Alto, CA'),
  ('Generic', 'info@generic.com', '1-555-123-4567', 'Various Locations');

-- Insert sample inventory items (using category and supplier references)
INSERT INTO public.inventory_items (name, sku, category_id, supplier_id, quantity, min_quantity, price, description) 
SELECT 
  'MacBook Pro 14"', 
  'APPLE-MBP14-001', 
  (SELECT id FROM public.categories WHERE name = 'Electronics'), 
  (SELECT id FROM public.suppliers WHERE name = 'Apple Inc.'), 
  25, 5, 1999.99, 
  'Professional laptop for development and design work'
UNION ALL SELECT 
  'Office Chair Ergonomic', 
  'FURN-CHAIR-002', 
  (SELECT id FROM public.categories WHERE name = 'Furniture'), 
  (SELECT id FROM public.suppliers WHERE name = 'Herman Miller'), 
  12, 10, 299.99, 
  'Ergonomic office chair with lumbar support'
UNION ALL SELECT 
  'Wireless Mouse', 
  'COMP-MOUSE-003', 
  (SELECT id FROM public.categories WHERE name = 'Computer Accessories'), 
  (SELECT id FROM public.suppliers WHERE name = 'Logitech'), 
  150, 20, 49.99, 
  'Wireless optical mouse with precision tracking'
UNION ALL SELECT 
  'Standing Desk', 
  'FURN-DESK-004', 
  (SELECT id FROM public.categories WHERE name = 'Furniture'), 
  (SELECT id FROM public.suppliers WHERE name = 'IKEA'), 
  8, 3, 599.99, 
  'Adjustable height standing desk'
UNION ALL SELECT 
  'iPhone 15 Pro', 
  'APPLE-IP15P-005', 
  (SELECT id FROM public.categories WHERE name = 'Electronics'), 
  (SELECT id FROM public.suppliers WHERE name = 'Apple Inc.'), 
  3, 10, 999.99, 
  'Latest iPhone with advanced camera system'
UNION ALL SELECT 
  'LED Monitor 27"', 
  'COMP-MON-006', 
  (SELECT id FROM public.categories WHERE name = 'Computer Accessories'), 
  (SELECT id FROM public.suppliers WHERE name = 'Dell'), 
  45, 15, 349.99, 
  '27-inch LED monitor with 4K resolution';