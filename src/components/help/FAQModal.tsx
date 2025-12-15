import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your registered email address. You will receive a password reset link within a few minutes. Check your spam folder if you don\'t see the email.',
    category: 'Authentication',
    keywords: ['password', 'reset', 'forgot', 'login', 'access'],
  },
  {
    id: '2',
    question: 'How do I add a new inventory item?',
    answer: 'Navigate to the Inventory section, click the "Add Item" button, fill in the required fields (Name, SKU, Price), and click Save. You can also add optional details like category, supplier, and minimum stock level.',
    category: 'Inventory',
    keywords: ['add', 'create', 'new', 'item', 'product', 'inventory'],
  },
  {
    id: '3',
    question: 'What do the different order statuses mean?',
    answer: 'Pending: Order received but not processed. Processing: Order is being prepared. Shipped: Order has been dispatched. Delivered: Customer received the order. Cancelled: Order was cancelled.',
    category: 'Orders',
    keywords: ['order', 'status', 'pending', 'processing', 'shipped', 'delivered'],
  },
  {
    id: '4',
    question: 'How do I update stock quantities?',
    answer: 'Find the item in the inventory list, click the "Update Stock" button, enter the quantity to add or remove (use negative numbers to subtract), add optional notes, and confirm the update.',
    category: 'Inventory',
    keywords: ['stock', 'quantity', 'update', 'add', 'remove', 'adjust'],
  },
  {
    id: '5',
    question: 'Why can\'t I access certain features?',
    answer: 'Feature access is based on your user role. Staff members have limited access to administrative functions like user management and advanced analytics. Contact your administrator if you need elevated permissions.',
    category: 'Permissions',
    keywords: ['access', 'permission', 'role', 'admin', 'staff', 'restricted'],
  },
  {
    id: '6',
    question: 'How do I export reports?',
    answer: 'Navigate to the Reports section, select the type of report you want, configure any filters or date ranges, then click the Export button. You can choose between PDF and Excel formats.',
    category: 'Reports',
    keywords: ['export', 'download', 'pdf', 'excel', 'report', 'data'],
  },
  {
    id: '7',
    question: 'What triggers low stock alerts?',
    answer: 'Low stock alerts are triggered when an item\'s quantity falls below its minimum quantity threshold. You can set this threshold when creating or editing an item. Low stock items are highlighted on the dashboard.',
    category: 'Inventory',
    keywords: ['low', 'stock', 'alert', 'minimum', 'threshold', 'warning'],
  },
  {
    id: '8',
    question: 'How do I add a new supplier?',
    answer: 'Go to the Suppliers section, click "Add Supplier", fill in the company name and contact details (email, phone, address), and save. You can then link this supplier to inventory items.',
    category: 'Suppliers',
    keywords: ['supplier', 'vendor', 'add', 'create', 'contact'],
  },
  {
    id: '9',
    question: 'Can I use Google to sign in?',
    answer: 'Yes! On the login page, you\'ll see a "Continue with Google" button. Click it to authenticate using your Google account. This is a quick and secure way to access the system.',
    category: 'Authentication',
    keywords: ['google', 'oauth', 'signin', 'login', 'social'],
  },
  {
    id: '10',
    question: 'How do I change my user role?',
    answer: 'User roles can only be changed by administrators. If you need a role change, contact your system administrator. They can update your role from the User Management section.',
    category: 'Permissions',
    keywords: ['role', 'change', 'admin', 'staff', 'permission', 'upgrade'],
  },
  {
    id: '11',
    question: 'How do I create a new order?',
    answer: 'Navigate to Orders, click "New Order", enter customer information (name, email, phone), add items with quantities, set an optional delivery date, add any notes, and submit the order.',
    category: 'Orders',
    keywords: ['order', 'create', 'new', 'customer', 'purchase'],
  },
  {
    id: '12',
    question: 'How does the analytics dashboard work?',
    answer: 'The analytics dashboard provides visual insights into your business data. It shows revenue trends, top-selling items, category distribution, and order volumes. Data updates in real-time as you process orders.',
    category: 'Reports',
    keywords: ['analytics', 'dashboard', 'charts', 'graphs', 'insights', 'data'],
  },
  {
    id: '13',
    question: 'What is an SKU and why is it required?',
    answer: 'SKU (Stock Keeping Unit) is a unique identifier for each product. It helps track inventory accurately and prevents duplicate entries. Each item must have a unique SKU.',
    category: 'Inventory',
    keywords: ['sku', 'identifier', 'unique', 'code', 'product'],
  },
  {
    id: '14',
    question: 'How do I view transaction history?',
    answer: 'Transaction history is available in the Reports section under "Transactions". You can filter by date range, transaction type, and item to see all stock movements.',
    category: 'Reports',
    keywords: ['transaction', 'history', 'log', 'audit', 'movement'],
  },
  {
    id: '15',
    question: 'Is my data backed up?',
    answer: 'Yes, all data is automatically backed up to secure cloud servers. Backups occur regularly to ensure data safety. Contact support if you need to restore data from a backup.',
    category: 'System',
    keywords: ['backup', 'data', 'restore', 'security', 'cloud'],
  },
];

interface FAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FAQModal = ({ open, onOpenChange }: FAQModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(faqData.map((item) => item.category)));
  }, []);

  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === null || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Frequently Asked Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* FAQ List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredFAQs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No questions found matching your search.
                </p>
              ) : (
                filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium pr-4">{item.question}</span>
                      {expandedId === item.id ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    {expandedId === item.id && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-sm text-muted-foreground">
                          {item.answer}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
