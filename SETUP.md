# LogistX Setup Guide

This guide will walk you through setting up LogistX from scratch.

## 🚀 Quick Setup (5 minutes)

### Step 1: Prerequisites
Make sure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)

### Step 2: Clone and Install
```bash
git clone <your-repo-url>
cd logistx-inventory-hub
npm install
```

### Step 3: Supabase Setup

#### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `logistx-inventory`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Click "Create new project"

#### 3.2 Get Your Credentials
1. Go to Settings > API
2. Copy your:
   - Project URL
   - Anon public key

#### 3.3 Update Configuration
Edit `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key-here";
```

#### 3.4 Set Up Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250830161340_1e5706de-744f-4496-8659-33dce8efa873.sql`
4. Run the query
5. Repeat for `supabase/migrations/20250830161403_7b86732c-886d-45a8-bf03-f5a54adb493b.sql`

### Step 4: Create Your First User

#### Option A: Through Supabase Dashboard
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Go to Table Editor > profiles
5. Find your user and set role to 'admin'

#### Option B: Through Application
1. Start the app: `npm run dev`
2. Go to the signup page (if enabled)
3. Create an admin account

### Step 5: Start the Application
```bash
npm run dev
```

Visit `http://localhost:5173` and log in with your admin credentials!

## 🔧 Detailed Setup

### Environment Configuration

#### Supabase Configuration
The application uses Supabase for:
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- Row Level Security

#### Database Schema
The database includes these tables:
- `profiles` - User information and roles
- `categories` - Product categories
- `suppliers` - Supplier information
- `inventory_items` - Core inventory data
- `inventory_transactions` - Audit trail

### User Roles

#### Admin User
- Full system access
- Can manage users
- Can manage all inventory
- Access to all reports
- Can delete items

#### Staff User
- Can update inventory quantities
- Can view inventory
- Limited reporting access
- Cannot delete items
- Cannot manage users

### Sample Data
The setup includes sample data:
- 6 product categories
- 9 suppliers
- 6 sample inventory items

## 🚨 Troubleshooting

### Common Issues

#### "Invalid credentials" error
- Check your Supabase URL and key
- Ensure the user exists in the profiles table
- Verify the user has the correct role

#### Database connection issues
- Verify your Supabase project is active
- Check that migrations were applied successfully
- Ensure RLS policies are enabled

#### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Update dependencies: `npm update`

#### Permission errors
- Check user role in profiles table
- Verify RLS policies are correct
- Ensure user is authenticated

### Getting Help

1. Check the browser console for errors
2. Check the Supabase dashboard for database issues
3. Review the README.md for detailed documentation
4. Create an issue in the repository

## 🔐 Security Notes

### Production Deployment
Before deploying to production:

1. **Environment Variables**
   - Use environment variables for Supabase credentials
   - Never commit API keys to version control

2. **Database Security**
   - Review and test RLS policies
   - Ensure proper user roles
   - Regular security audits

3. **Authentication**
   - Enable email confirmation
   - Set up proper password policies
   - Consider 2FA for admin accounts

### Best Practices
- Regular database backups
- Monitor user activity
- Keep dependencies updated
- Use HTTPS in production

## 📊 Initial Configuration

### Setting Up Categories
1. Go to Inventory Management
2. Add items will show category dropdown
3. Categories are pre-populated but can be managed

### Setting Up Suppliers
1. Suppliers are pre-populated
2. Can be managed through admin interface
3. Each item can be linked to a supplier

### Inventory Management
1. Start by adding your first inventory item
2. Set appropriate minimum quantities
3. Configure pricing and descriptions
4. Test the low-stock alerts

## 🎯 Next Steps

After setup:
1. Create additional users as needed
2. Add your inventory items
3. Configure categories and suppliers
4. Set up reporting schedules
5. Train your team on the system

## 📞 Support

If you encounter issues:
1. Check this setup guide
2. Review the main README.md
3. Check Supabase documentation
4. Create an issue in the repository

---

**Happy inventory managing! 🎉**
