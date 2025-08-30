import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  DollarSign,
  ShoppingCart
} from "lucide-react";

interface AdminDashboardProps {
  inventoryData: any[];
}

export const AdminDashboard = ({ inventoryData }: AdminDashboardProps) => {
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.quantity < item.minQuantity);
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalUsers = 25; // Mock data
  const totalOrders = 147; // Mock data
  const monthlyRevenue = 28450; // Mock data

  const stats = [
    {
      title: "Total Inventory Items",
      value: totalItems.toString(),
      icon: Package,
      description: "Active products in stock",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      description: "Items below minimum quantity",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Total Stock Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Current inventory worth",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Active Users",
      value: totalUsers.toString(),
      icon: Users,
      description: "Staff and admin accounts",
      color: "text-accent-foreground",
      bgColor: "bg-accent"
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: "Orders this month",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Monthly Revenue",
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: "Revenue this month",
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  const topProducts = inventoryData
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Low Stock Alerts</span>
            </CardTitle>
            <CardDescription>
              Items that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                All items are well stocked!
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {item.quantity} left
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: {item.minQuantity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Products by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Top Products by Value</span>
            </CardTitle>
            <CardDescription>
              Highest value inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((item, index) => {
              const value = item.quantity * item.price;
              const maxValue = topProducts[0] ? topProducts[0].quantity * topProducts[0].price : 1;
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} units × ${item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${value.toLocaleString()}</p>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};