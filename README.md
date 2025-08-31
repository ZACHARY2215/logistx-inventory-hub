# LogistX - Inventory Management System

A comprehensive web-based inventory management system built with React, TypeScript, and Supabase. LogistX provides role-based access control, real-time inventory tracking, and comprehensive reporting capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication & Role Management**
  - Secure login with Supabase Auth
  - Role-based permissions (Admin vs Staff)
  - User profile management

- **Inventory Management**
  - Add, update, delete, and search items
  - Track stock levels with low-stock alerts
  - Category and supplier management
  - Real-time inventory updates

- **Reporting & Exporting**
  - Generate comprehensive reports
  - Export data as CSV, PDF, TXT, and Excel
  - Low stock alerts and inventory value reports
  - Transaction history tracking

- **Role-Based Access Control**
  - **Admin**: Full system access, user management, inventory control
  - **Staff**: Inventory updates, order processing, limited reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend & Database
- **Supabase** (PostgreSQL)
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **Supabase Auth** for authentication

### Export Libraries
- **jsPDF** for PDF generation
- **SheetJS (xlsx)** for Excel export
- **Native CSV/TXT** export functionality

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd logistx-inventory-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

#### Database Setup
The database schema is already configured in the `supabase/migrations/` folder. Run these migrations in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migration files in order:
   - `20250830161340_1e5706de-744f-4496-8659-33dce8efa873.sql`
   - `20250830161403_7b86732c-886d-45a8-bf03-f5a54adb493b.sql`

#### Configure Environment Variables
Update the Supabase configuration in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "your-project-url";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

### 4. Create Initial Users

#### Method 1: Through Supabase Dashboard
1. Go to Authentication > Users in your Supabase dashboard
2. Create users manually and assign roles in the profiles table

#### Method 2: Through the Application
1. Start the application
2. Use the signup functionality (if enabled)
3. Or create users through the admin panel

### 5. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Database Schema

### Tables

#### `profiles`
- User profile information
- Links to Supabase Auth users
- Role-based access control

#### `categories`
- Product categories
- Hierarchical organization

#### `suppliers`
- Supplier information
- Contact details and addresses

#### `inventory_items`
- Core inventory data
- Stock levels and pricing
- Foreign keys to categories and suppliers

#### `inventory_transactions`
- Audit trail for all inventory changes
- Transaction history and user tracking

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access data they're authorized to see
- Admins have full access
- Staff have limited access based on their role

## 🔐 Authentication & Authorization

### User Roles

#### Administrator
- Full system access
- User management
- Inventory CRUD operations
- All reporting features
- System configuration

#### Staff
- Inventory updates (quantities, stock levels)
- Order processing
- Basic reporting
- Limited user information access

### Security Features
- JWT-based authentication via Supabase
- Row Level Security (RLS) policies
- Role-based UI components
- Secure API endpoints

## 📈 Reporting Features

### Available Reports
1. **Complete Inventory Report**
   - All items with full details
   - Stock levels and values

2. **Low Stock Alert Report**
   - Items below minimum quantity
   - Reorder recommendations

3. **Inventory Value Report**
   - Items sorted by total value
   - Percentage of total inventory

4. **Transaction History Report**
   - All inventory changes
   - User activity tracking

### Export Formats
- **CSV**: For spreadsheet applications
- **Excel**: Advanced formatting and charts
- **PDF**: Professional reports for printing
- **TXT**: Plain text for simple data exchange

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### Modern UI Components
- shadcn/ui component library
- Consistent design system
- Accessible components
- Dark/light mode support

### Real-time Updates
- Live inventory changes
- Instant notifications
- Collaborative features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

### Other Platforms
The application is a standard React SPA and can be deployed to any static hosting service.

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── inventory/      # Inventory management
│   ├── layout/         # Layout components
│   ├── reports/        # Reporting components
│   ├── ui/             # Base UI components
│   └── users/          # User management
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
├── pages/              # Page components
└── data/               # Mock data and constants
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations are applied

#### Authentication Problems
- Clear browser storage
- Check Supabase Auth settings
- Verify user roles in profiles table

#### Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📝 API Documentation

### Supabase Integration
The application uses Supabase's auto-generated APIs:

#### Authentication
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { name: 'User Name', role: 'staff' }
  }
});
```

#### Data Operations
```typescript
// Fetch inventory items
const { data, error } = await supabase
  .from('inventory_items')
  .select(`
    *,
    category:categories(name),
    supplier:suppliers(name)
  `);

// Insert new item
const { data, error } = await supabase
  .from('inventory_items')
  .insert([{
    name: 'Product Name',
    sku: 'SKU-001',
    quantity: 100,
    price: 29.99
  }]);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the Supabase documentation

## 🔮 Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Barcode scanning integration
- [ ] Mobile app (React Native)
- [ ] Multi-location inventory
- [ ] Purchase order management
- [ ] Integration with accounting systems
- [ ] Advanced reporting with charts
- [ ] Automated reorder points
- [ ] Supplier portal
- [ ] API for third-party integrations

---

Built with ❤️ using React, TypeScript, and Supabase