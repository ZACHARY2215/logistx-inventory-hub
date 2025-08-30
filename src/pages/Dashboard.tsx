import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { mockInventoryData, InventoryItem } from "@/data/mockData";

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
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>(mockInventoryData);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('logistx-inventory');
    if (saved) {
      try {
        setInventoryData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when inventory changes
  useEffect(() => {
    localStorage.setItem('logistx-inventory', JSON.stringify(inventoryData));
  }, [inventoryData]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleUpdateInventory = (newData: InventoryItem[]) => {
    setInventoryData(newData);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return user.role === 'admin' ? (
          <AdminDashboard inventoryData={inventoryData} />
        ) : (
          <StaffDashboard 
            inventoryData={inventoryData}
            onNavigate={handleNavigate}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement
            inventoryData={inventoryData}
            onUpdateInventory={handleUpdateInventory}
            userRole={user.role}
          />
        );
      case 'orders':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
            <p className="text-muted-foreground">Coming soon - Order processing and management</p>
          </div>
        );
      case 'reports':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Reports & Analytics</h3>
            <p className="text-muted-foreground">Coming soon - Detailed reporting and exports</p>
          </div>
        );
      case 'users':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-muted-foreground">Coming soon - Staff and admin account management</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Coming soon - Advanced analytics and insights</p>
          </div>
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