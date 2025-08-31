# LogistX API Documentation

This document describes the API endpoints and data structures used in LogistX.

## Overview

LogistX uses Supabase as its backend, which provides auto-generated REST APIs for all database operations. The application also includes custom business logic and real-time subscriptions.

## Authentication

All API calls require authentication via Supabase Auth. The authentication token is automatically included in requests.

### Authentication Flow
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

## Database Schema

### Tables

#### profiles
User profile information linked to Supabase Auth.

```typescript
interface Profile {
  id: string;           // UUID
  user_id: string;      // UUID (references auth.users)
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

#### categories
Product categories for inventory organization.

```typescript
interface Category {
  id: string;           // UUID
  name: string;
  description?: string;
  created_at: string;   // ISO timestamp
}
```

#### suppliers
Supplier information for inventory items.

```typescript
interface Supplier {
  id: string;           // UUID
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

#### inventory_items
Core inventory data with stock levels and pricing.

```typescript
interface InventoryItem {
  id: string;           // UUID
  name: string;
  sku: string;          // Unique identifier
  category_id?: string; // UUID (references categories)
  supplier_id?: string; // UUID (references suppliers)
  quantity: number;     // Current stock level
  min_quantity: number; // Minimum stock level
  price: number;        // Unit price
  description?: string;
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

#### inventory_transactions
Audit trail for all inventory changes.

```typescript
interface InventoryTransaction {
  id: string;           // UUID
  item_id: string;      // UUID (references inventory_items)
  user_id: string;      // UUID (references profiles.user_id)
  transaction_type: 'add' | 'remove' | 'adjust' | 'create' | 'update' | 'delete';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  notes?: string;
  created_at: string;   // ISO timestamp
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/v1/token?grant_type=password
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "User Name",
      "role": "admin"
    }
  }
}
```

#### POST /auth/v1/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "options": {
    "data": {
      "name": "User Name",
      "role": "staff"
    }
  }
}
```

### Data Endpoints

All data endpoints follow the pattern: `/rest/v1/{table_name}`

#### GET /rest/v1/inventory_items
Fetch inventory items with related data.

**Query Parameters:**
- `select`: Specify columns to return
- `order`: Sort results
- `eq`: Filter by equality
- `gte`: Filter by greater than or equal
- `lte`: Filter by less than or equal

**Example:**
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select(`
    *,
    category:categories(name),
    supplier:suppliers(name)
  `)
  .order('created_at', { ascending: false });
```

#### POST /rest/v1/inventory_items
Create a new inventory item.

**Request:**
```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "category_id": "category-uuid",
  "supplier_id": "supplier-uuid",
  "quantity": 100,
  "min_quantity": 10,
  "price": 29.99,
  "description": "Product description"
}
```

#### PATCH /rest/v1/inventory_items?id=eq.{item_id}
Update an inventory item.

**Request:**
```json
{
  "quantity": 95,
  "price": 31.99
}
```

#### DELETE /rest/v1/inventory_items?id=eq.{item_id}
Delete an inventory item.

### Real-time Subscriptions

#### Subscribe to Inventory Changes
```typescript
const subscription = supabase
  .channel('inventory_items')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'inventory_items' },
    (payload) => {
      console.log('Inventory changed:', payload);
    }
  )
  .subscribe();
```

#### Subscribe to User Changes
```typescript
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('User changed:', payload);
    }
  )
  .subscribe();
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### profiles
- Users can view their own profile
- Users can update their own profile
- Admins can view all profiles

### inventory_items
- Authenticated users can view all items
- Admins can insert, update, and delete items
- Staff can update item quantities

### categories
- Authenticated users can view all categories
- Only admins can insert, update, or delete categories

### suppliers
- Authenticated users can view all suppliers
- Only admins can insert, update, or delete suppliers

### inventory_transactions
- Authenticated users can view all transactions
- Users can insert transactions for their own actions

## Error Handling

### Common Error Responses

#### Authentication Errors
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

#### Permission Errors
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy"
}
```

#### Validation Errors
```json
{
  "code": "23514",
  "details": "Failing row contains (uuid, name, sku, ...)",
  "hint": null,
  "message": "new row for relation \"inventory_items\" violates check constraint"
}
```

## Rate Limiting

Supabase has built-in rate limiting:
- Free tier: 500 requests per hour
- Pro tier: 100,000 requests per hour

## Best Practices

### 1. Use Select Statements Efficiently
```typescript
// Good: Only select needed columns
const { data } = await supabase
  .from('inventory_items')
  .select('id, name, quantity, price');

// Bad: Select all columns when not needed
const { data } = await supabase
  .from('inventory_items')
  .select('*');
```

### 2. Handle Errors Properly
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .insert(newItem);

if (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
  return;
}

// Use data
console.log('Success:', data);
```

### 3. Use Real-time Subscriptions Wisely
```typescript
// Subscribe to specific changes
const subscription = supabase
  .channel('inventory')
  .on('postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'inventory_items',
      filter: 'quantity=lt.10' // Only low stock items
    },
    handleLowStockAlert
  )
  .subscribe();

// Clean up subscriptions
useEffect(() => {
  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

### 4. Optimize Queries
```typescript
// Use indexes for better performance
const { data } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('category_id', categoryId) // Use indexed column
  .order('name'); // Use indexed column for sorting
```

## Testing

### Unit Tests
```typescript
// Test inventory operations
describe('Inventory Management', () => {
  test('should create inventory item', async () => {
    const newItem = {
      name: 'Test Item',
      sku: 'TEST-001',
      quantity: 10,
      price: 9.99
    };
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(newItem);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Test complete workflows
describe('Inventory Workflow', () => {
  test('should handle stock adjustment', async () => {
    // 1. Get current item
    const { data: item } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('sku', 'TEST-001')
      .single();
    
    // 2. Update quantity
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: item.quantity - 5 })
      .eq('id', item.id);
    
    // 3. Create transaction record
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        item_id: item.id,
        user_id: userId,
        transaction_type: 'remove',
        quantity_change: -5,
        previous_quantity: item.quantity,
        new_quantity: item.quantity - 5
      });
    
    expect(updateError).toBeNull();
    expect(transactionError).toBeNull();
  });
});
```

## Monitoring and Analytics

### Key Metrics to Monitor
- API response times
- Error rates
- Database query performance
- User authentication success rates
- Real-time subscription connections

### Logging
```typescript
// Log important operations
const logInventoryChange = async (itemId: string, change: any) => {
  console.log('Inventory change:', {
    itemId,
    change,
    timestamp: new Date().toISOString(),
    userId: user.id
  });
};
```

---

For more information, see the [Supabase Documentation](https://supabase.com/docs) and the main [README.md](./README.md).
