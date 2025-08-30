export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  lastUpdated: string;
}

export const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    sku: 'APPLE-MBP14-001',
    category: 'Electronics',
    quantity: 25,
    minQuantity: 5,
    price: 1999.99,
    supplier: 'Apple Inc.',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Office Chair Ergonomic',
    sku: 'FURN-CHAIR-002',
    category: 'Furniture',
    quantity: 12,
    minQuantity: 10,
    price: 299.99,
    supplier: 'Herman Miller',
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Wireless Mouse',
    sku: 'COMP-MOUSE-003',
    category: 'Computer Accessories',
    quantity: 150,
    minQuantity: 20,
    price: 49.99,
    supplier: 'Logitech',
    lastUpdated: '2024-01-13'
  },
  {
    id: '4',
    name: 'Standing Desk',
    sku: 'FURN-DESK-004',
    category: 'Furniture',
    quantity: 8,
    minQuantity: 3,
    price: 599.99,
    supplier: 'IKEA',
    lastUpdated: '2024-01-12'
  },
  {
    id: '5',
    name: 'iPhone 15 Pro',
    sku: 'APPLE-IP15P-005',
    category: 'Electronics',
    quantity: 3,
    minQuantity: 10,
    price: 999.99,
    supplier: 'Apple Inc.',
    lastUpdated: '2024-01-11'
  },
  {
    id: '6',
    name: 'LED Monitor 27"',
    sku: 'COMP-MON-006',
    category: 'Computer Accessories',
    quantity: 45,
    minQuantity: 15,
    price: 349.99,
    supplier: 'Dell',
    lastUpdated: '2024-01-10'
  },
  {
    id: '7',
    name: 'Mechanical Keyboard',
    sku: 'COMP-KB-007',
    category: 'Computer Accessories',
    quantity: 5,
    minQuantity: 12,
    price: 129.99,
    supplier: 'Corsair',
    lastUpdated: '2024-01-09'
  },
  {
    id: '8',
    name: 'Coffee Machine',
    sku: 'APPL-COFFEE-008',
    category: 'Appliances',
    quantity: 20,
    minQuantity: 8,
    price: 199.99,
    supplier: 'Breville',
    lastUpdated: '2024-01-08'
  },
  {
    id: '9',
    name: 'Printer All-in-One',
    sku: 'COMP-PRINT-009',
    category: 'Office Equipment',
    quantity: 15,
    minQuantity: 5,
    price: 249.99,
    supplier: 'HP',
    lastUpdated: '2024-01-07'
  },
  {
    id: '10',
    name: 'Tablet Stand',
    sku: 'ACC-STAND-010',
    category: 'Accessories',
    quantity: 2,
    minQuantity: 15,
    price: 39.99,
    supplier: 'Generic',
    lastUpdated: '2024-01-06'
  },
  {
    id: '11',
    name: 'Webcam HD',
    sku: 'COMP-CAM-011',
    category: 'Computer Accessories',
    quantity: 30,
    minQuantity: 10,
    price: 89.99,
    supplier: 'Logitech',
    lastUpdated: '2024-01-05'
  }
];