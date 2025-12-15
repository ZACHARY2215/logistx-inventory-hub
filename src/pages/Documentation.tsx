import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Search, BookOpen, Users, Package, 
  ShoppingCart, Truck, BarChart3, FileText, Settings, 
  Shield, HelpCircle, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQModal } from '@/components/help/FAQModal';
import { generateManualPDF } from '@/lib/generatePDF';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [faqOpen, setFaqOpen] = useState(false);

  const sections = [
    { id: 'overview', title: 'System Overview', icon: BookOpen },
    { id: 'getting-started', title: 'Getting Started', icon: ChevronRight },
    { id: 'authentication', title: 'Authentication', icon: Shield },
    { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', title: 'Inventory Management', icon: Package },
    { id: 'orders', title: 'Orders Management', icon: ShoppingCart },
    { id: 'suppliers', title: 'Suppliers Management', icon: Truck },
    { id: 'reports', title: 'Reports & Analytics', icon: FileText },
    { id: 'users', title: 'User Management', icon: Users },
    { id: 'settings', title: 'System Settings', icon: Settings },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">LogistX Documentation</h1>
              <p className="text-sm text-muted-foreground">System & User Manual</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setFaqOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Search FAQ
            </Button>
            <Button onClick={generateManualPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav className="p-4 pt-0 space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">System Overview</CardTitle>
                  </div>
                  <CardDescription>
                    Introduction to LogistX Inventory Management System
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <p>
                    LogistX is a comprehensive inventory management system designed to streamline 
                    your business operations. It provides real-time tracking, automated alerts, 
                    and detailed analytics to help you manage your inventory efficiently.
                  </p>
                  
                  <h3>Key Features</h3>
                  <ul>
                    <li><strong>Real-time Inventory Tracking:</strong> Monitor stock levels across all locations</li>
                    <li><strong>Order Management:</strong> Process and track customer orders</li>
                    <li><strong>Supplier Management:</strong> Maintain supplier relationships and contacts</li>
                    <li><strong>Analytics & Reports:</strong> Generate insights from your data</li>
                    <li><strong>User Management:</strong> Role-based access control</li>
                    <li><strong>Low Stock Alerts:</strong> Automatic notifications when stock is low</li>
                  </ul>

                  <h3>System Requirements</h3>
                  <ul>
                    <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>Stable internet connection</li>
                    <li>Screen resolution: 1024x768 or higher recommended</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Getting Started</CardTitle>
                  </div>
                  <CardDescription>Quick start guide for new users</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>First-Time Setup</h3>
                  <ol>
                    <li>Navigate to the LogistX login page</li>
                    <li>Sign up for a new account or sign in with existing credentials</li>
                    <li>Complete your profile setup</li>
                    <li>Wait for admin approval (if required)</li>
                    <li>Start managing your inventory!</li>
                  </ol>

                  <h3>Demo Accounts</h3>
                  <p>For testing purposes, you can use the following demo accounts:</p>
                  <div className="not-prose">
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge>Admin</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p><strong>Email:</strong> admin@logistx.com</p>
                          <p><strong>Password:</strong> admin123</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge variant="secondary">Staff</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p><strong>Email:</strong> staff@logistx.com</p>
                          <p><strong>Password:</strong> staff123</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Authentication</CardTitle>
                  </div>
                  <CardDescription>Login, registration, and security</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Sign In Methods</h3>
                  <ul>
                    <li><strong>Email & Password:</strong> Traditional authentication</li>
                    <li><strong>Google Sign-In:</strong> Quick access using your Google account</li>
                  </ul>

                  <h3>Password Requirements</h3>
                  <ul>
                    <li>Minimum 6 characters</li>
                    <li>Recommended: Mix of letters, numbers, and symbols</li>
                  </ul>

                  <h3>Security Best Practices</h3>
                  <ul>
                    <li>Never share your login credentials</li>
                    <li>Use a strong, unique password</li>
                    <li>Log out when using shared computers</li>
                    <li>Report suspicious activity immediately</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Dashboard */}
            <section id="dashboard" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Dashboard</CardTitle>
                  </div>
                  <CardDescription>Understanding your dashboard views</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Admin Dashboard</h3>
                  <p>The admin dashboard provides a comprehensive overview including:</p>
                  <ul>
                    <li>Total inventory items and value</li>
                    <li>Revenue and order statistics</li>
                    <li>Low stock alerts</li>
                    <li>Recent transactions</li>
                    <li>Performance charts</li>
                  </ul>

                  <h3>Staff Dashboard</h3>
                  <p>Staff members see a simplified view with:</p>
                  <ul>
                    <li>Quick action buttons</li>
                    <li>Assigned tasks</li>
                    <li>Recent items</li>
                    <li>Stock status overview</li>
                  </ul>

                  <h3>Navigation</h3>
                  <p>Use the sidebar to navigate between different modules. On mobile devices, 
                     tap the menu icon to reveal the navigation.</p>
                </CardContent>
              </Card>
            </section>

            {/* Inventory Management */}
            <section id="inventory" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Inventory Management</CardTitle>
                  </div>
                  <CardDescription>Managing your inventory items</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Adding New Items</h3>
                  <ol>
                    <li>Click the "Add Item" button</li>
                    <li>Fill in the required fields:
                      <ul>
                        <li>Name (required)</li>
                        <li>SKU - Stock Keeping Unit (required, unique)</li>
                        <li>Category</li>
                        <li>Quantity</li>
                        <li>Price</li>
                        <li>Minimum Quantity (for low stock alerts)</li>
                        <li>Supplier</li>
                        <li>Description</li>
                      </ul>
                    </li>
                    <li>Click "Save" to add the item</li>
                  </ol>

                  <h3>Editing Items</h3>
                  <ol>
                    <li>Find the item in the inventory list</li>
                    <li>Click the "Edit" button (pencil icon)</li>
                    <li>Modify the desired fields</li>
                    <li>Click "Save Changes"</li>
                  </ol>

                  <h3>Stock Updates</h3>
                  <p>To update stock quantities:</p>
                  <ol>
                    <li>Click "Update Stock" on an item</li>
                    <li>Enter the quantity change (positive to add, negative to subtract)</li>
                    <li>Add optional notes for the transaction</li>
                    <li>Confirm the update</li>
                  </ol>

                  <h3>Low Stock Alerts</h3>
                  <p>Items are flagged when their quantity falls below the minimum threshold. 
                     These items appear with a warning indicator in the inventory list.</p>
                </CardContent>
              </Card>
            </section>

            {/* Orders Management */}
            <section id="orders" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Orders Management</CardTitle>
                  </div>
                  <CardDescription>Processing and tracking orders</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Creating Orders</h3>
                  <ol>
                    <li>Click "New Order"</li>
                    <li>Enter customer information:
                      <ul>
                        <li>Customer Name</li>
                        <li>Email Address</li>
                        <li>Phone Number (optional)</li>
                      </ul>
                    </li>
                    <li>Add items to the order</li>
                    <li>Set delivery date (optional)</li>
                    <li>Add notes if needed</li>
                    <li>Submit the order</li>
                  </ol>

                  <h3>Order Status</h3>
                  <div className="not-prose">
                    <div className="flex flex-wrap gap-2 my-4">
                      <Badge variant="outline">Pending</Badge>
                      <Badge className="bg-blue-500">Processing</Badge>
                      <Badge className="bg-yellow-500">Shipped</Badge>
                      <Badge className="bg-green-500">Delivered</Badge>
                      <Badge variant="destructive">Cancelled</Badge>
                    </div>
                  </div>

                  <h3>Updating Order Status</h3>
                  <ol>
                    <li>Find the order in the orders list</li>
                    <li>Click the status dropdown</li>
                    <li>Select the new status</li>
                    <li>Status change is saved automatically</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Suppliers Management */}
            <section id="suppliers" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Suppliers Management</CardTitle>
                  </div>
                  <CardDescription>Managing supplier relationships</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Adding Suppliers</h3>
                  <ol>
                    <li>Navigate to Suppliers module</li>
                    <li>Click "Add Supplier"</li>
                    <li>Enter supplier details:
                      <ul>
                        <li>Company Name</li>
                        <li>Contact Email</li>
                        <li>Phone Number</li>
                        <li>Address</li>
                      </ul>
                    </li>
                    <li>Save the supplier</li>
                  </ol>

                  <h3>Linking Suppliers to Items</h3>
                  <p>When adding or editing inventory items, you can select a supplier from 
                     the dropdown menu to link the item to that supplier.</p>
                </CardContent>
              </Card>
            </section>

            {/* Reports & Analytics */}
            <section id="reports" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Reports & Analytics</CardTitle>
                  </div>
                  <CardDescription>Generating insights from your data</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Available Reports</h3>
                  <ul>
                    <li><strong>Inventory Report:</strong> Current stock levels and values</li>
                    <li><strong>Sales Report:</strong> Order history and revenue</li>
                    <li><strong>Low Stock Report:</strong> Items needing reorder</li>
                    <li><strong>Supplier Report:</strong> Supplier performance metrics</li>
                  </ul>

                  <h3>Exporting Data</h3>
                  <p>Reports can be exported in the following formats:</p>
                  <ul>
                    <li>PDF - For printing and sharing</li>
                    <li>Excel (XLSX) - For further analysis</li>
                  </ul>

                  <h3>Analytics Dashboard</h3>
                  <p>The analytics section provides visual charts including:</p>
                  <ul>
                    <li>Revenue trends over time</li>
                    <li>Top selling items</li>
                    <li>Category distribution</li>
                    <li>Order volume analysis</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* User Management */}
            <section id="users" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">User Management</CardTitle>
                  </div>
                  <CardDescription>Managing system users (Admin only)</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>User Roles</h3>
                  <div className="not-prose">
                    <div className="grid gap-4 md:grid-cols-2 my-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Admin</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Full system access</li>
                            <li>User management</li>
                            <li>All reports & analytics</li>
                            <li>System configuration</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Staff</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Inventory management</li>
                            <li>Order processing</li>
                            <li>View suppliers</li>
                            <li>Basic reports</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <h3>Managing Users</h3>
                  <ul>
                    <li><strong>View Users:</strong> See all registered users</li>
                    <li><strong>Change Roles:</strong> Promote or demote users</li>
                    <li><strong>Deactivate:</strong> Disable user accounts</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Settings */}
            <section id="settings" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">System Settings</CardTitle>
                  </div>
                  <CardDescription>Configuring your system preferences</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <h3>Profile Settings</h3>
                  <ul>
                    <li>Update your display name</li>
                    <li>Change password</li>
                    <li>Manage notification preferences</li>
                  </ul>

                  <h3>System Preferences (Admin)</h3>
                  <ul>
                    <li>Configure low stock thresholds</li>
                    <li>Set up email notifications</li>
                    <li>Manage categories</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                  </div>
                  <CardDescription>Common questions and answers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setFaqOpen(true)} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Open Searchable FAQ
                  </Button>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">How do I reset my password?</h4>
                      <p className="text-sm text-muted-foreground">
                        Click "Forgot Password" on the login page and enter your email. 
                        You'll receive a password reset link.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Why can't I see certain features?</h4>
                      <p className="text-sm text-muted-foreground">
                        Feature visibility depends on your user role. Staff members have 
                        limited access compared to administrators.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How do I export my data?</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate to Reports, select the report type, and click the 
                        Export button to download as PDF or Excel.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">What happens when stock is low?</h4>
                      <p className="text-sm text-muted-foreground">
                        Items below their minimum quantity threshold are highlighted 
                        with a warning. The dashboard shows a count of low stock items.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <FAQModal open={faqOpen} onOpenChange={setFaqOpen} />
    </div>
  );
};

export default Documentation;
