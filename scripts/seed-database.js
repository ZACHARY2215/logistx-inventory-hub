import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://npmeujpnbpqbotksxcdt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbWV1anBuYnBxYm90a3N4Y2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1Njk0NzIsImV4cCI6MjA3MjE0NTQ3Mn0.Sdb_K1rt6A25Ma-X69ZL17uNR2Wu-8ufwBTIqHDnLxw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert categories
    console.log('📂 Inserting categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        { name: 'Electronics', description: 'Electronic devices and components' },
        { name: 'Furniture', description: 'Office and workspace furniture' },
        { name: 'Computer Accessories', description: 'Computer peripherals and accessories' },
        { name: 'Office Equipment', description: 'General office equipment' },
        { name: 'Appliances', description: 'Kitchen and office appliances' },
        { name: 'Accessories', description: 'General accessories and supplies' }
      ])
      .select();

    if (categoriesError) {
      console.error('❌ Error inserting categories:', categoriesError);
      return;
    }
    console.log('✅ Categories inserted:', categories.length);

    // 2. Insert suppliers
    console.log('🏢 Inserting suppliers...');
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .insert([
        { name: 'Apple Inc.', contact_email: 'business@apple.com', contact_phone: '1-800-APL-CARE', address: 'Cupertino, CA' },
        { name: 'Herman Miller', contact_email: 'sales@hermanmiller.com', contact_phone: '1-800-646-4400', address: 'Zeeland, MI' },
        { name: 'Logitech', contact_email: 'business@logitech.com', contact_phone: '1-646-454-3200', address: 'Newark, CA' },
        { name: 'IKEA', contact_email: 'business@ikea.com', contact_phone: '1-888-888-4532', address: 'Conshohocken, PA' },
        { name: 'Dell', contact_email: 'sales@dell.com', contact_phone: '1-800-915-3355', address: 'Round Rock, TX' },
        { name: 'Corsair', contact_email: 'business@corsair.com', contact_phone: '1-888-222-4346', address: 'Fremont, CA' },
        { name: 'Breville', contact_email: 'sales@breville.com', contact_phone: '1-866-273-8455', address: 'Sydney, Australia' },
        { name: 'HP', contact_email: 'business@hp.com', contact_phone: '1-800-474-6836', address: 'Palo Alto, CA' },
        { name: 'Generic', contact_email: 'info@generic.com', contact_phone: '1-555-123-4567', address: 'Various Locations' }
      ])
      .select();

    if (suppliersError) {
      console.error('❌ Error inserting suppliers:', suppliersError);
      return;
    }
    console.log('✅ Suppliers inserted:', suppliers.length);

    // 3. Insert inventory items
    console.log('📦 Inserting inventory items...');
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert([
        {
          name: 'MacBook Pro 14"',
          sku: 'APPLE-MBP14-001',
          category_id: categories[0].id, // Electronics
          supplier_id: suppliers[0].id, // Apple Inc.
          quantity: 25,
          min_quantity: 5,
          price: 1999.99,
          description: 'Professional laptop for development and design work'
        },
        {
          name: 'Office Chair Ergonomic',
          sku: 'FURN-CHAIR-002',
          category_id: categories[1].id, // Furniture
          supplier_id: suppliers[1].id, // Herman Miller
          quantity: 12,
          min_quantity: 10,
          price: 299.99,
          description: 'Ergonomic office chair with lumbar support'
        },
        {
          name: 'Wireless Mouse',
          sku: 'COMP-MOUSE-003',
          category_id: categories[2].id, // Computer Accessories
          supplier_id: suppliers[2].id, // Logitech
          quantity: 150,
          min_quantity: 20,
          price: 49.99,
          description: 'Wireless optical mouse with precision tracking'
        },
        {
          name: 'Standing Desk',
          sku: 'FURN-DESK-004',
          category_id: categories[1].id, // Furniture
          supplier_id: suppliers[3].id, // IKEA
          quantity: 8,
          min_quantity: 3,
          price: 599.99,
          description: 'Adjustable height standing desk'
        },
        {
          name: 'iPhone 15 Pro',
          sku: 'APPLE-IP15P-005',
          category_id: categories[0].id, // Electronics
          supplier_id: suppliers[0].id, // Apple Inc.
          quantity: 3,
          min_quantity: 10,
          price: 999.99,
          description: 'Latest iPhone with advanced camera system'
        },
        {
          name: 'LED Monitor 27"',
          sku: 'COMP-MON-006',
          category_id: categories[2].id, // Computer Accessories
          supplier_id: suppliers[4].id, // Dell
          quantity: 45,
          min_quantity: 15,
          price: 349.99,
          description: '27-inch LED monitor with 4K resolution'
        }
      ])
      .select();

    if (itemsError) {
      console.error('❌ Error inserting inventory items:', itemsError);
      return;
    }
    console.log('✅ Inventory items inserted:', items.length);

    // 4. Create a test user profile
    console.log('👤 Creating test user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
          email: 'admin@logistx.com',
          name: 'System Administrator',
          role: 'admin'
        }
      ])
      .select();

    if (profileError) {
      console.log('⚠️ Note: Profile creation failed (this is normal for demo):', profileError.message);
    } else {
      console.log('✅ Test profile created');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary: ${categories.length} categories, ${suppliers.length} suppliers, ${items.length} inventory items`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seeding
seedDatabase();
