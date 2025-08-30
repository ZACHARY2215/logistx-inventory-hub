import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Plus,
  Edit,
  Eye
} from "lucide-react";

interface StaffDashboardProps {
  inventoryData: any[];
  onNavigate: (page: string) => void;
}

export const StaffDashboard = ({ inventoryData, onNavigate }: StaffDashboardProps) => {
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.quantity < item.minQuantity);
  const recentOrders = 12; // Mock data
  const completedTasks = 8; // Mock data

  const stats = [
    {
      title: "Inventory Items",
      value: totalItems.toString(),
      icon: Package,
      description: "Total products available",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      description: "Items needing attention",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Recent Orders",
      value: recentOrders.toString(),
      icon: ShoppingCart,
      description: "Orders processed today",
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  const quickActions = [
    {
      title: "Add New Item",
      description: "Add a new product to inventory",
      icon: Plus,
      action: () => onNavigate('inventory'),
      color: "bg-primary",
      textColor: "text-primary-foreground"
    },
    {
      title: "Update Stock",
      description: "Update existing item quantities",
      icon: Edit,
      action: () => onNavigate('inventory'),
      color: "bg-success",
      textColor: "text-success-foreground"
    },
    {
      title: "View Reports",
      description: "Check inventory reports",
      icon: Eye,
      action: () => onNavigate('inventory'),
      color: "bg-accent-foreground",
      textColor: "text-background"
    }
  ];

  const recentItems = inventoryData.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Staff Dashboard</h2>
        <p className="text-muted-foreground">
          Manage inventory and process orders efficiently
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-md mr-3 ${action.color}`}>
                    <Icon className={`h-4 w-4 ${action.textColor}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Recent Items</span>
            </CardTitle>
            <CardDescription>
              Recently added or updated items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.sku} • Category: {item.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Qty: {item.quantity}</p>
                  <Badge 
                    variant={item.quantity < item.minQuantity ? "destructive" : "secondary"}
                  >
                    {item.quantity < item.minQuantity ? "Low Stock" : "In Stock"}
                  </Badge>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => onNavigate('inventory')}
            >
              View All Items
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};