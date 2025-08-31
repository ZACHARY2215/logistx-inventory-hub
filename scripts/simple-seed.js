import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://npmeujpnbpqbotksxcdt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbWV1anBuYnBxYm90a3N4Y2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1Njk0NzIsImV4cCI6MjA3MjE0NTQ3Mn0.Sdb_K1rt6A25Ma-X69ZL17uNR2Wu-8ufwBTIqHDnLxw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function simpleSeed() {
  console.log('🌱 Starting simple database seeding...');

  try {
    // Test basic connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      console.log('💡 This might be due to RLS policies or missing permissions');
      return;
    }

    console.log('✅ Database connection successful');

    // Try to insert a simple category first
    console.log('📂 Testing category insertion...');
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({ name: 'Test Category', description: 'Test description' })
      .select();

    if (categoryError) {
      console.error('❌ Category insertion failed:', categoryError);
      console.log('🔧 RLS policies are blocking insertion. Need to fix permissions first.');
      return;
    }

    console.log('✅ Test category inserted successfully');
    console.log('🎉 Database is ready for data insertion!');

    // Clean up test data
    await supabase.from('categories').delete().eq('id', category[0].id);
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

simpleSeed();
