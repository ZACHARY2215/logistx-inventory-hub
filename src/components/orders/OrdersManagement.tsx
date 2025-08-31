import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  inventory_item?: {
    name: string;
    sku: string;
    category?: { name: string };
  };
}

interface OrdersManagementProps {
  userRole: 'admin' | 'staff';
}

export const OrdersManagement = ({ userRole }: OrdersManagementProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { items: inventoryItems } = useInventory();

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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      toast.error(errorMessage);
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch order items
  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          inventory_item:inventory_items(
            name,
            sku,
            category:categories(name)
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order items';
      toast.error(errorMessage);
      return [];
    }
  };

  // Generate order number
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${year}${month}${day}${random}`;
  };

  // Add new order
  const handleAddOrder = async () => {
    try {
      if (formData.items.length === 0) {
        toast.error('Please add at least one item to the order');
        return;
      }

      const orderNumber = generateOrderNumber();
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          order_date: new Date().toISOString(),
          delivery_date: formData.delivery_date,
          status: 'pending',
          total_amount: totalAmount,
          notes: formData.notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = formData.items.map(item => ({
        order_id: orderData.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Update inventory quantities
      for (const item of formData.items) {
        const inventoryItem = inventoryItems.find(inv => inv.id === item.inventory_item_id);
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - item.quantity;
          await supabase
            .from('inventory_items')
            .update({ quantity: newQuantity })
            .eq('id', item.inventory_item_id);
        }
      }

      toast.success('Order created successfully!');
      setIsAddDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(errorMessage);
      console.error('Error creating order:', error);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully!');
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      toast.error(errorMessage);
      console.error('Error updating order status:', error);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Restore inventory quantities first
      const items = await fetchOrderItems(orderId);
      for (const item of items) {
        const inventoryItem = inventoryItems.find(inv => inv.id === item.inventory_item_id);
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity + item.quantity;
          await supabase
            .from('inventory_items')
            .update({ quantity: newQuantity })
            .eq('id', item.inventory_item_id);
        }
      }

      // Delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Delete order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast.success('Order deleted successfully!');
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
      toast.error(errorMessage);
      console.error('Error deleting order:', error);
    }
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

  // Update item in order
  const updateOrderItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
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

  // View order details
  const handleViewOrder = async (order: Order) => {
    setViewingOrder(order);
    const items = await fetchOrderItems(order.id);
    setOrderItems(items);
    setIsViewDialogOpen(true);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders Management</h2>
          <p className="text-muted-foreground font-medium">
            Manage customer orders and track fulfillment status
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 font-medium">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
                <SelectItem value="pending" className="font-medium">Pending</SelectItem>
                <SelectItem value="processing" className="font-medium">Processing</SelectItem>
                <SelectItem value="shipped" className="font-medium">Shipped</SelectItem>
                <SelectItem value="delivered" className="font-medium">Delivered</SelectItem>
                <SelectItem value="cancelled" className="font-medium">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription className="font-medium">
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
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {userRole === 'admin' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingOrder(order);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Order</DialogTitle>
            <DialogDescription className="font-medium">
              Add a new customer order with items
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name" className="font-semibold">Customer Name *</Label>
                <Input
                  id="customer-name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-email" className="font-semibold">Customer Email *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="Enter customer email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-phone" className="font-semibold">Customer Phone</Label>
                <Input
                  id="customer-phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="Enter customer phone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-date" className="font-semibold">Delivery Date</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-semibold">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter order notes"
              />
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItemToOrder}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div className="grid gap-2">
                    <Label className="text-sm">Item</Label>
                    <Select
                      value={item.inventory_item_id}
                      onValueChange={(value) => {
                        updateOrderItem(index, 'inventory_item_id', value);
                        const selectedItem = inventoryItems.find(inv => inv.id === value);
                        if (selectedItem) {
                          updateOrderItem(index, 'unit_price', selectedItem.price);
                        }
                      }}
                    >
                      <SelectTrigger className="font-medium">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map(invItem => (
                          <SelectItem key={invItem.id} value={invItem.id} className="font-medium">
                            {invItem.name} - {invItem.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="grid gap-2 flex-1">
                      <Label className="text-sm">Total</Label>
                      <Input
                        value={(item.quantity * item.unit_price).toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemFromOrder(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrder}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
            <DialogDescription className="font-medium">
              View order information and items
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Order Number</Label>
                  <p className="text-sm">{viewingOrder.order_number}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge className={getStatusColor(viewingOrder.status)}>
                    {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Customer Name</Label>
                  <p className="text-sm">{viewingOrder.customer_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Customer Email</Label>
                  <p className="text-sm">{viewingOrder.customer_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Order Date</Label>
                  <p className="text-sm">{new Date(viewingOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Total Amount</Label>
                  <p className="text-sm font-bold">${viewingOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
              {viewingOrder.notes && (
                <div>
                  <Label className="font-semibold">Notes</Label>
                  <p className="text-sm">{viewingOrder.notes}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <Label className="font-semibold">Order Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Unit Price</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.inventory_item?.name}</TableCell>
                        <TableCell>{item.inventory_item?.sku}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Status Update (Admin only) */}
              {userRole === 'admin' && (
                <div className="space-y-2">
                  <Label className="font-semibold">Update Status</Label>
                  <Select
                    value={viewingOrder.status}
                    onValueChange={(value: Order['status']) => handleUpdateStatus(viewingOrder.id, value)}
                  >
                    <SelectTrigger className="font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="font-medium">Pending</SelectItem>
                      <SelectItem value="processing" className="font-medium">Processing</SelectItem>
                      <SelectItem value="shipped" className="font-medium">Shipped</SelectItem>
                      <SelectItem value="delivered" className="font-medium">Delivered</SelectItem>
                      <SelectItem value="cancelled" className="font-medium">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
