import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventory";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface ReportsManagementProps {
  userRole: 'admin' | 'staff';
}

export const ReportsManagement = ({ userRole }: ReportsManagementProps) => {
  const [reportType, setReportType] = useState<'inventory' | 'low-stock' | 'value' | 'transactions'>('inventory');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { items, lowStockItems, totalValue } = useInventory();

  const generateCSVReport = (data: Record<string, unknown>[], filename: string) => {
    const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
    const headers = Object.keys(data[0] || {}).join(',');
    const fullCSV = headers + '\n' + csvContent;
    
    const blob = new Blob([fullCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePDFReport = (data: Record<string, unknown>[], filename: string, title: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    if (dateRange.from && dateRange.to) {
      doc.text(`Date Range: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, 20, 35);
    }
    
    // Add table headers
    const headers = Object.keys(data[0] || {});
    const colWidth = 180 / headers.length;
    let yPosition = 50;
    
    doc.setFontSize(8);
    headers.forEach((header, index) => {
      doc.text(header, 20 + (index * colWidth), yPosition);
    });
    
    // Add table data
    yPosition += 10;
    data.slice(0, 20).forEach((row, rowIndex) => { // Limit to 20 rows for PDF
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      Object.values(row).forEach((value, colIndex) => {
        const cellValue = String(value).substring(0, 15); // Truncate long values
        doc.text(cellValue, 20 + (colIndex * colWidth), yPosition);
      });
      yPosition += 8;
    });
    
    if (data.length > 20) {
      doc.text(`... and ${data.length - 20} more items`, 20, yPosition + 10);
    }
    
    doc.save(`${filename}.pdf`);
  };

  const generateTXTReport = (data: Record<string, unknown>[], filename: string, title: string) => {
    let content = `${title}\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    
    if (dateRange.from && dateRange.to) {
      content += `Date Range: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}\n`;
    }
    
    content += '\n';
    
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      content += headers.join('\t') + '\n';
      
      data.forEach(row => {
        content += Object.values(row).join('\t') + '\n';
      });
    } else {
      content += 'No data available for the selected criteria.\n';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateExcelReport = (data: Record<string, unknown>[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const getReportData = () => {
    switch (reportType) {
      case 'inventory':
        return items.map(item => ({
          'Product Name': item.name,
          'SKU': item.sku,
          'Category': item.category?.name || 'N/A',
          'Supplier': item.supplier?.name || 'N/A',
          'Quantity': item.quantity,
          'Min Quantity': item.min_quantity,
          'Price': `₱${item.price.toFixed(2)}`,
          'Total Value': `₱${(item.quantity * item.price).toFixed(2)}`,
          'Status': item.quantity < item.min_quantity ? 'Low Stock' : 'In Stock',
          'Last Updated': new Date(item.updated_at).toLocaleDateString()
        }));
      
      case 'low-stock':
        return lowStockItems.map(item => ({
          'Product Name': item.name,
          'SKU': item.sku,
          'Category': item.category?.name || 'N/A',
          'Current Stock': item.quantity,
          'Min Required': item.min_quantity,
          'Shortage': item.min_quantity - item.quantity,
          'Price': `₱${item.price.toFixed(2)}`,
          'Supplier': item.supplier?.name || 'N/A',
          'Last Updated': new Date(item.updated_at).toLocaleDateString()
        }));
      
      case 'value':
        return items
          .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
          .map(item => ({
            'Product Name': item.name,
            'SKU': item.sku,
            'Category': item.category?.name || 'N/A',
            'Quantity': item.quantity,
            'Unit Price': `₱${item.price.toFixed(2)}`,
            'Total Value': `₱${(item.quantity * item.price).toFixed(2)}`,
            'Percentage of Total': `${((item.quantity * item.price) / totalValue * 100).toFixed(1)}%`
          }));
      
      case 'transactions':
        // Mock transaction data - in a real app, this would come from the database
        return [
          {
            'Date': new Date().toLocaleDateString(),
            'Type': 'Stock Adjustment',
            'Product': 'MacBook Pro 14"',
            'SKU': 'APPLE-MBP14-001',
            'Quantity Change': '+5',
            'Previous Qty': '20',
            'New Qty': '25',
            'User': 'Admin User',
            'Notes': 'Stock replenishment'
          }
        ];
      
      default:
        return [];
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'txt' | 'excel') => {
    setIsGenerating(true);
    
    try {
      const data = getReportData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportType}-report-${timestamp}`;
      
      switch (format) {
        case 'csv':
          generateCSVReport(data, filename);
          break;
        case 'pdf':
          generatePDFReport(data, filename, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
          break;
        case 'txt':
          generateTXTReport(data, filename, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
          break;
        case 'excel':
          generateExcelReport(data, filename);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const reportStats = [
    {
      title: "Total Items",
      value: items.length.toString(),
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: "Total Inventory Value",
      value: `₱${totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-success"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h2>
        <p className="text-muted-foreground font-medium">
          Generate comprehensive reports and export data in multiple formats
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {reportStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Configure your report parameters and export format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={(value: 'inventory' | 'low-stock' | 'value' | 'transactions') => setReportType(value)}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory" className="font-medium">Complete Inventory Report</SelectItem>
                  <SelectItem value="low-stock" className="font-medium">Low Stock Alert Report</SelectItem>
                  <SelectItem value="value" className="font-medium">Inventory Value Report</SelectItem>
                  <SelectItem value="transactions" className="font-medium">Transaction History Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range (Optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isGenerating}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span>CSV</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isGenerating}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span>Excel</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isGenerating}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <FileText className="h-6 w-6" />
                <span>PDF</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExport('txt')}
                disabled={isGenerating}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <File className="h-6 w-6" />
                <span>TXT</span>
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Generating report...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Preview of the selected report data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
              </h3>
              <Badge variant="secondary">
                {getReportData().length} items
              </Badge>
            </div>
            
            {getReportData().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(getReportData()[0]).map((header) => (
                        <th key={header} className="text-left p-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getReportData().slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getReportData().length > 5 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 5 items of {getReportData().length} total items
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data available for the selected report type
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
