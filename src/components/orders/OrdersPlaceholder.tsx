import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface OrdersPlaceholderProps {
  userRole: 'admin' | 'staff';
}

export const OrdersPlaceholder = ({ userRole }: OrdersPlaceholderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders Management</h2>
          <p className="text-muted-foreground font-medium">
            Manage customer orders and track fulfillment status
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Orders System Coming Soon</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            The orders management system is under development. This feature will allow you to:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid gap-2 text-sm text-muted-foreground max-w-md mx-auto text-left">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Create and manage customer orders
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Track order status and fulfillment
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Automatically update inventory levels
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Generate order reports and analytics
            </div>
          </div>
          
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm">
              <AlertCircle className="h-3 w-3" />
              Database tables for orders need to be created first
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="pt-4">
              <Button disabled variant="outline">
                Setup Orders System
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Contact your developer to set up the orders database tables
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};