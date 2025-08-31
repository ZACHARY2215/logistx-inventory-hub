import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory } from "@/hooks/useInventory";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  AlertTriangle
} from "lucide-react";
import type { InventoryItem, Category, Supplier } from "@/types/inventory";

interface InventoryManagementProps {
  inventoryData: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  userRole: 'admin' | 'staff';
}

export const InventoryManagement = ({ 
  inventoryData, 
  onUpdateInventory, 
  userRole 
}: InventoryManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    quantity: "",
    min_quantity: "",
    price: "",
    supplier_id: "",
    description: ""
  });
  
  const { items, categories, suppliers, loading, addItem, updateItem, deleteItem } = useInventory();

  // Use the data passed from parent or fallback to hook data
  const displayItems = inventoryData?.length > 0 ? inventoryData : items;
  const displayCategories = categories || [];
  const displaySuppliers = suppliers || [];

  const categoriesList = displayCategories.map(cat => cat.name);
  const suppliersList = displaySuppliers.map(sup => sup.name);
  
  const filteredItems = displayItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = item.category?.name || '';
    const matchesCategory = selectedCategory === "all" || categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show loading state while data is being fetched
  if (loading && displayItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const handleAddItem = async () => {
    if (!formData.name || !formData.sku || !formData.quantity || !formData.price) {
      return;
    }

    const newItem = {
      name: formData.name,
      sku: formData.sku,
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
      quantity: parseInt(formData.quantity),
      min_quantity: parseInt(formData.min_quantity) || 10,
      price: parseFloat(formData.price),
      description: formData.description || null
    };

    const result = await addItem(newItem);
    if (result.success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.quantity || !formData.price) {
      return;
    }

    const updates = {
      name: formData.name,
      category_id: formData.category_id || editingItem.category_id,
      supplier_id: formData.supplier_id || editingItem.supplier_id,
      quantity: parseInt(formData.quantity),
      min_quantity: parseInt(formData.min_quantity) || editingItem.min_quantity,
      price: parseFloat(formData.price),
      description: formData.description || editingItem.description
    };

    const result = await updateItem(editingItem.id, updates);
    if (result.success) {
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (userRole !== 'admin') {
      return;
    }

    const result = await deleteItem(itemId);
    if (result.success) {
      // Item deleted successfully
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category_id: item.category_id || "",
      quantity: item.quantity.toString(),
      min_quantity: item.min_quantity.toString(),
      price: item.price.toString(),
      supplier_id: item.supplier_id || "",
      description: item.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category_id: "",
      quantity: "",
      min_quantity: "",
      price: "",
      supplier_id: "",
      description: ""
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'SKU', 'Category', 'Quantity', 'Min Quantity', 'Price', 'Supplier', 'Last Updated'],
      ...filteredItems.map(item => [
        item.name,
        item.sku,
        item.category?.name || 'N/A',
        item.quantity.toString(),
        item.min_quantity.toString(),
        item.price.toString(),
        item.supplier?.name || 'N/A',
        new Date(item.updated_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground font-medium">
            Manage your product inventory and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {userRole === 'admin' && (
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          )}
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 font-medium">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Categories</SelectItem>
                {categoriesList.map(categoryName => (
                  <SelectItem key={categoryName} value={categoryName} className="font-medium">
                    {categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Inventory Items ({filteredItems.length})</CardTitle>
          <CardDescription className="font-medium">
            Current stock levels and product information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Supplier</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated: {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.quantity}</span>
                        {item.quantity < item.min_quantity && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.min_quantity}
                      </p>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.quantity < item.min_quantity ? "destructive" : "secondary"}
                        className={item.quantity >= item.min_quantity ? "bg-success/10 text-success hover:bg-success/20" : ""}
                      >
                        {item.quantity < item.min_quantity ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {userRole === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Item</DialogTitle>
            <DialogDescription className="font-medium">
              Add a new product to the inventory system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-semibold">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku" className="font-semibold">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="font-semibold">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="font-medium">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="font-semibold">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minQuantity" className="font-semibold">Min Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="font-semibold">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier" className="font-semibold">Supplier</Label>
              <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {displaySuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id} className="font-medium">
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-semibold">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Item</DialogTitle>
            <DialogDescription className="font-medium">
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="font-semibold">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category" className="font-semibold">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="font-medium">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity" className="font-semibold">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minQuantity" className="font-semibold">Min Quantity</Label>
                <Input
                  id="edit-minQuantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price" className="font-semibold">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-supplier" className="font-semibold">Supplier</Label>
              <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {displaySuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id} className="font-medium">
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="font-semibold">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};