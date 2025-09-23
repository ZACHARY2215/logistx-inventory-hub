import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { ReportsManagement } from "@/components/reports/ReportsManagement";
import { UserManagement } from "@/components/users/UserManagement";
import { OrdersManagement } from "@/components/orders/OrdersManagement";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { SuppliersManagement } from "@/components/suppliers/SuppliersManagement";
import { useInventory } from "@/hooks/useInventory";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  name: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { items: inventoryData } = useInventory();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return user.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <StaffDashboard 
            onNavigate={handleNavigate}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement 
            inventoryData={inventoryData}
            onUpdateInventory={() => {}} // This will be handled by the useInventory hook
            userRole={user.role}
          />
        );
      case 'suppliers':
        return (
          <SuppliersManagement userRole={user.role} />
        );
      case 'orders':
        return (
          <OrdersManagement userRole={user.role} />
        );
      case 'reports':
        return (
          <ReportsManagement userRole={user.role} />
        );
      case 'users':
        return (
          <UserManagement userRole={user.role} />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard userRole={user.role} />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Page Not Found</h3>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </DashboardLayout>
  );
};