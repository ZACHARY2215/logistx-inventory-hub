import jsPDF from 'jspdf';

export const generateManualPDF = () => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = 20;
  
  const addTitle = (text: string, fontSize: number = 20) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += fontSize / 2 + 5;
  };
  
  const addHeading = (text: string, fontSize: number = 14) => {
    checkPageBreak(20);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPosition);
    yPosition += 8;
  };
  
  const addParagraph = (text: string, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(10);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  };
  
  const addBullet = (text: string) => {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    doc.text('•', margin, yPosition);
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkPageBreak(10);
      doc.text(line, margin + 8, yPosition);
      yPosition += 5;
    });
  };
  
  const addNumberedItem = (number: number, text: string) => {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth - 12);
    doc.text(`${number}.`, margin, yPosition);
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkPageBreak(10);
      doc.text(line, margin + 10, yPosition);
      yPosition += 5;
    });
  };
  
  const addSpace = (space: number = 10) => {
    yPosition += space;
  };
  
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };
  
  // Cover Page
  yPosition = 80;
  addTitle('LogistX', 32);
  addTitle('Inventory Management System', 18);
  addSpace(20);
  addTitle('System & User Manual', 16);
  addSpace(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  doc.text('Version 1.0', pageWidth / 2, yPosition, { align: 'center' });
  
  // Table of Contents
  doc.addPage();
  yPosition = 20;
  addTitle('Table of Contents', 18);
  addSpace(10);
  
  const tocItems = [
    '1. System Overview',
    '2. Getting Started',
    '3. Authentication',
    '4. Dashboard',
    '5. Inventory Management',
    '6. Orders Management',
    '7. Suppliers Management',
    '8. Reports & Analytics',
    '9. User Management',
    '10. FAQ',
  ];
  
  tocItems.forEach((item) => {
    doc.setFontSize(12);
    doc.text(item, margin, yPosition);
    yPosition += 8;
  });
  
  // Section 1: System Overview
  doc.addPage();
  yPosition = 20;
  addTitle('1. System Overview', 16);
  addSpace(5);
  
  addParagraph('LogistX is a comprehensive inventory management system designed to streamline your business operations. It provides real-time tracking, automated alerts, and detailed analytics to help you manage your inventory efficiently.');
  
  addHeading('Key Features');
  addBullet('Real-time Inventory Tracking: Monitor stock levels across all locations');
  addBullet('Order Management: Process and track customer orders');
  addBullet('Supplier Management: Maintain supplier relationships and contacts');
  addBullet('Analytics & Reports: Generate insights from your data');
  addBullet('User Management: Role-based access control');
  addBullet('Low Stock Alerts: Automatic notifications when stock is low');
  
  addSpace(5);
  addHeading('System Requirements');
  addBullet('Modern web browser (Chrome, Firefox, Safari, Edge)');
  addBullet('Stable internet connection');
  addBullet('Screen resolution: 1024x768 or higher recommended');
  
  // Section 2: Getting Started
  doc.addPage();
  yPosition = 20;
  addTitle('2. Getting Started', 16);
  addSpace(5);
  
  addHeading('First-Time Setup');
  addNumberedItem(1, 'Navigate to the LogistX login page');
  addNumberedItem(2, 'Sign up for a new account or sign in with existing credentials');
  addNumberedItem(3, 'Complete your profile setup');
  addNumberedItem(4, 'Wait for admin approval (if required)');
  addNumberedItem(5, 'Start managing your inventory!');
  
  addSpace(5);
  addHeading('Demo Accounts');
  addParagraph('For testing purposes, you can use the following demo accounts:');
  addSpace(3);
  addParagraph('Admin Account:');
  addBullet('Email: admin@logistx.com');
  addBullet('Password: admin123');
  addSpace(3);
  addParagraph('Staff Account:');
  addBullet('Email: staff@logistx.com');
  addBullet('Password: staff123');
  
  // Section 3: Authentication
  doc.addPage();
  yPosition = 20;
  addTitle('3. Authentication', 16);
  addSpace(5);
  
  addHeading('Sign In Methods');
  addBullet('Email & Password: Traditional authentication');
  addBullet('Google Sign-In: Quick access using your Google account');
  
  addSpace(5);
  addHeading('Password Requirements');
  addBullet('Minimum 6 characters');
  addBullet('Recommended: Mix of letters, numbers, and symbols');
  
  addSpace(5);
  addHeading('Security Best Practices');
  addBullet('Never share your login credentials');
  addBullet('Use a strong, unique password');
  addBullet('Log out when using shared computers');
  addBullet('Report suspicious activity immediately');
  
  // Section 4: Dashboard
  doc.addPage();
  yPosition = 20;
  addTitle('4. Dashboard', 16);
  addSpace(5);
  
  addHeading('Admin Dashboard');
  addParagraph('The admin dashboard provides a comprehensive overview including:');
  addBullet('Total inventory items and value');
  addBullet('Revenue and order statistics');
  addBullet('Low stock alerts');
  addBullet('Recent transactions');
  addBullet('Performance charts');
  
  addSpace(5);
  addHeading('Staff Dashboard');
  addParagraph('Staff members see a simplified view with:');
  addBullet('Quick action buttons');
  addBullet('Assigned tasks');
  addBullet('Recent items');
  addBullet('Stock status overview');
  
  // Section 5: Inventory Management
  doc.addPage();
  yPosition = 20;
  addTitle('5. Inventory Management', 16);
  addSpace(5);
  
  addHeading('Adding New Items');
  addNumberedItem(1, 'Click the "Add Item" button');
  addNumberedItem(2, 'Fill in the required fields: Name, SKU, Category, Quantity, Price, Minimum Quantity, Supplier, Description');
  addNumberedItem(3, 'Click "Save" to add the item');
  
  addSpace(5);
  addHeading('Editing Items');
  addNumberedItem(1, 'Find the item in the inventory list');
  addNumberedItem(2, 'Click the "Edit" button (pencil icon)');
  addNumberedItem(3, 'Modify the desired fields');
  addNumberedItem(4, 'Click "Save Changes"');
  
  addSpace(5);
  addHeading('Stock Updates');
  addParagraph('To update stock quantities:');
  addNumberedItem(1, 'Click "Update Stock" on an item');
  addNumberedItem(2, 'Enter the quantity change (positive to add, negative to subtract)');
  addNumberedItem(3, 'Add optional notes for the transaction');
  addNumberedItem(4, 'Confirm the update');
  
  // Section 6: Orders Management
  doc.addPage();
  yPosition = 20;
  addTitle('6. Orders Management', 16);
  addSpace(5);
  
  addHeading('Creating Orders');
  addNumberedItem(1, 'Click "New Order"');
  addNumberedItem(2, 'Enter customer information: Name, Email, Phone');
  addNumberedItem(3, 'Add items to the order');
  addNumberedItem(4, 'Set delivery date (optional)');
  addNumberedItem(5, 'Add notes if needed');
  addNumberedItem(6, 'Submit the order');
  
  addSpace(5);
  addHeading('Order Status');
  addBullet('Pending: Order received but not processed');
  addBullet('Processing: Order is being prepared');
  addBullet('Shipped: Order has been dispatched');
  addBullet('Delivered: Customer received the order');
  addBullet('Cancelled: Order was cancelled');
  
  // Section 7: Suppliers Management
  doc.addPage();
  yPosition = 20;
  addTitle('7. Suppliers Management', 16);
  addSpace(5);
  
  addHeading('Adding Suppliers');
  addNumberedItem(1, 'Navigate to Suppliers module');
  addNumberedItem(2, 'Click "Add Supplier"');
  addNumberedItem(3, 'Enter supplier details: Company Name, Contact Email, Phone Number, Address');
  addNumberedItem(4, 'Save the supplier');
  
  addSpace(5);
  addHeading('Linking Suppliers to Items');
  addParagraph('When adding or editing inventory items, you can select a supplier from the dropdown menu to link the item to that supplier.');
  
  // Section 8: Reports & Analytics
  doc.addPage();
  yPosition = 20;
  addTitle('8. Reports & Analytics', 16);
  addSpace(5);
  
  addHeading('Available Reports');
  addBullet('Inventory Report: Current stock levels and values');
  addBullet('Sales Report: Order history and revenue');
  addBullet('Low Stock Report: Items needing reorder');
  addBullet('Supplier Report: Supplier performance metrics');
  
  addSpace(5);
  addHeading('Exporting Data');
  addParagraph('Reports can be exported in the following formats:');
  addBullet('PDF - For printing and sharing');
  addBullet('Excel (XLSX) - For further analysis');
  
  // Section 9: User Management
  doc.addPage();
  yPosition = 20;
  addTitle('9. User Management', 16);
  addSpace(5);
  
  addHeading('User Roles');
  addSpace(3);
  addParagraph('Admin:');
  addBullet('Full system access');
  addBullet('User management');
  addBullet('All reports & analytics');
  addBullet('System configuration');
  
  addSpace(3);
  addParagraph('Staff:');
  addBullet('Inventory management');
  addBullet('Order processing');
  addBullet('View suppliers');
  addBullet('Basic reports');
  
  // Section 10: FAQ
  doc.addPage();
  yPosition = 20;
  addTitle('10. Frequently Asked Questions', 16);
  addSpace(5);
  
  const faqs = [
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a password reset link.' },
    { q: 'Why can\'t I see certain features?', a: 'Feature visibility depends on your user role. Staff members have limited access compared to administrators.' },
    { q: 'How do I export my data?', a: 'Navigate to Reports, select the report type, and click the Export button to download as PDF or Excel.' },
    { q: 'What happens when stock is low?', a: 'Items below their minimum quantity threshold are highlighted with a warning. The dashboard shows a count of low stock items.' },
    { q: 'Can I use Google to sign in?', a: 'Yes! On the login page, you\'ll see a "Continue with Google" button for quick authentication.' },
    { q: 'How do I add a new supplier?', a: 'Go to the Suppliers section, click "Add Supplier", fill in the details, and save.' },
  ];
  
  faqs.forEach((faq, index) => {
    checkPageBreak(25);
    addHeading(`Q${index + 1}: ${faq.q}`, 11);
    addParagraph(faq.a);
    addSpace(3);
  });
  
  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `LogistX User Manual - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('LogistX_User_Manual.pdf');
};
