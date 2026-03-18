
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const Reports: React.FC = () => {
  const { products, sales, customers, suppliers } = useSelector((state: RootState) => state.stock);

  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalDue = customers.reduce((acc, c) => acc + c.pendingDue, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  // Chart Data
  const salesByDate = sales.reduce((acc: any[], s) => {
    const date = new Date(s.date).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += s.totalAmount;
    } else {
      acc.push({ date, amount: s.totalAmount });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  const categoryDistribution = products.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.quantity;
    } else {
      acc.push({ name: p.category, value: p.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success('Report exported successfully!');
  };

  const exportToCSV = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-zinc-500 mt-1">Deep dive into your business performance and inventory health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-zinc-900 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-zinc-100" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none">+12.5%</Badge>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Total Sales Revenue</p>
            <h3 className="text-3xl font-bold mt-1">${totalSales.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <Badge variant="outline" className="text-red-500 border-red-100 dark:border-red-900/30">High Priority</Badge>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Total Outstanding Dues</p>
            <h3 className="text-3xl font-bold mt-1">${totalDue.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Package className="w-5 h-5 text-zinc-500" />
              </div>
              <Badge variant="outline" className="text-zinc-500 border-zinc-100 dark:border-zinc-800">Asset Value</Badge>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Inventory Valuation</p>
            <h3 className="text-3xl font-bold mt-1">${totalInventoryValue.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <TabsTrigger value="sales" className="rounded-lg px-6">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg px-6">Inventory Report</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg px-6">Customer Dues</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-lg px-6">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg">Sales Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesByDate}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Export Sales Data</CardTitle>
                <CardDescription>Download your transaction history for external analysis.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-xl justify-between px-6 border-zinc-200 dark:border-zinc-800"
                  onClick={() => exportToExcel(sales, 'sales_report')}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-bold">Export to Excel</p>
                      <p className="text-xs text-zinc-500">Full transaction details in .xlsx</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-400" />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 rounded-xl justify-between px-6 border-zinc-200 dark:border-zinc-800"
                  onClick={() => exportToCSV(sales, 'sales_report')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <p className="font-bold">Export to CSV</p>
                      <p className="text-xs text-zinc-500">Standard comma-separated values</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-400" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Inventory Actions</CardTitle>
                <CardDescription>Manage and export your current stock levels.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-xl justify-between px-6 border-zinc-200 dark:border-zinc-800"
                  onClick={() => exportToExcel(products, 'inventory_report')}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-orange-500" />
                    <div className="text-left">
                      <p className="font-bold">Stock Inventory (.xlsx)</p>
                      <p className="text-xs text-zinc-500">Current stock, prices, and status</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-400" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Customer Due Report</CardTitle>
                <CardDescription>Customers with outstanding balances.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportToExcel(customers.filter(c => c.pendingDue > 0), 'customer_dues')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.filter(c => c.pendingDue > 0).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Users className="h-5 w-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{customer.name}</p>
                        <p className="text-xs text-zinc-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">${customer.pendingDue.toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Pending Due</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Supplier Report</CardTitle>
                <CardDescription>Overview of all active suppliers.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportToExcel(suppliers, 'supplier_report')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold">{supplier.company}</h4>
                      <Badge variant="secondary">{supplier.name}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500">{supplier.email}</p>
                    <p className="text-xs text-zinc-500">{supplier.phone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
