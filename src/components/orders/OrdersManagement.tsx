import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  ShoppingCart,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  X
} from "lucide-react";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";

interface OrdersManagementProps {
  userRole: 'admin' | 'staff';
}

export const OrdersManagement = ({ userRole }: OrdersManagementProps) => {
  const { orders, loading, orderStats, addOrder, updateOrderStatus, deleteOrder, fetchOrderItems } = useOrders();
  const { items: inventoryItems } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingOrderItems, setViewingOrderItems] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_date: "",
    notes: "",
    items: [] as Array<{
      inventory_item_id: string;
      quantity: number;
      unit_price: number;
    }>
  });

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status styling
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="status-badge-pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="status-badge-info"><AlertCircle className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-info/10 text-info border-info/20"><Truck className="w-3 h-3 mr-1" />Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="status-badge-success"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handle form submission
  const handleAddOrder = async () => {
    if (!formData.customer_name || !formData.customer_email || formData.items.length === 0) {
      return;
    }

    const result = await addOrder(formData, formData.items);
    if (result.success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (userRole !== 'admin') return;
    await deleteOrder(orderId);
  };

  // View order details
  const handleViewOrder = async (order: Order) => {
    setViewingOrder(order);
    const items = await fetchOrderItems(order.id);
    setViewingOrderItems(items);
    setIsViewDialogOpen(true);
  };

  // Add item to order
  const addItemToOrder = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventory_item_id: "", quantity: 1, unit_price: 0 }]
    }));
  };

  // Remove item from order
  const removeItemFromOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update order item
  const updateOrderItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-set price when item is selected
          if (field === 'inventory_item_id' && value) {
            const selectedItem = inventoryItems.find(inv => inv.id === value);
            if (selectedItem) {
              updatedItem.unit_price = selectedItem.price;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      delivery_date: "",
      notes: "",
      items: []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-gradient rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Orders Management</h2>
          <p className="text-muted-foreground font-medium">
            Manage customer orders and track fulfillment status
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="btn-gradient">
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Orders</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-primary">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground font-medium">
              {orderStats.today} today
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Pending Orders</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-accent">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gradient">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Revenue</CardTitle>
            <div className="p-2 rounded-lg gradient-primary">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              ${orderStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              All orders combined
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Delivered Orders</CardTitle>
            <div className="p-2 rounded-lg bg-success">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{orderStats.delivered}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-enhanced">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-accent"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 focus-accent dropdown-content">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="dropdown-content">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gradient">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Customer orders and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Order #</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm font-semibold">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gradient">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="hover-accent"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {userRole === 'admin' && (
                          <>
                            <Select 
                              value={order.status} 
                              onValueChange={(value: Order['status']) => handleStatusUpdate(order.id, value)}
                            >
                              <SelectTrigger className="w-auto h-8">
                                <Edit className="h-4 w-4" />
                              </SelectTrigger>
                              <SelectContent className="dropdown-content">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-destructive hover:text-destructive hover-accent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl popover-content">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient">Create New Order</DialogTitle>
            <DialogDescription>
              Add a new customer order to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name" className="font-semibold">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="focus-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email" className="font-semibold">Customer Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="Enter email address"
                  className="focus-accent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="font-semibold">Phone Number</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="focus-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date" className="font-semibold">Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="focus-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Order Items</Label>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 p-4 border rounded-lg bg-muted/20">
                  <Select 
                    value={item.inventory_item_id} 
                    onValueChange={(value) => updateOrderItem(index, 'inventory_item_id', value)}
                  >
                    <SelectTrigger className="flex-1 dropdown-content">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent className="dropdown-content">
                      {inventoryItems.map(inventoryItem => (
                        <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                          {inventoryItem.name} - ${inventoryItem.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemFromOrder(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addItemToOrder} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-semibold">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter order notes"
                className="focus-accent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrder} className="btn-gradient">Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl popover-content">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient">
              Order Details - {viewingOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Complete order information and items
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Customer</Label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-semibold">{viewingOrder.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{viewingOrder.customer_email}</p>
                    {viewingOrder.customer_phone && (
                      <p className="text-sm text-muted-foreground">{viewingOrder.customer_phone}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Order Info</Label>
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      {getStatusBadge(viewingOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="font-bold text-gradient">${viewingOrder.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Date:</span>
                      <span className="text-sm">{new Date(viewingOrder.order_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {viewingOrderItems.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-semibold">Order Items</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingOrderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.inventory_item?.name}</p>
                                <p className="text-sm text-muted-foreground">{item.inventory_item?.sku}</p>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">${item.total_price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {viewingOrder.notes && (
                <div className="space-y-2">
                  <Label className="font-semibold">Notes</Label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{viewingOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};