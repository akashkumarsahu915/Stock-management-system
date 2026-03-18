
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Receipt, 
  ChevronRight, 
  Download, 
  Printer,
  MoreVertical,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sale } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SalesHistory: React.FC = () => {
  const { sales, customers } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const generateInvoicePDF = (sale: Sale) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('StockMaster Pro - Invoice', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${sale.invoiceId}`, 20, 40);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`, 20, 45);
    doc.text(`Seller: ${sale.sellerName}`, 20, 50);
    
    doc.text('Customer Details:', 140, 40);
    doc.text(`Name: ${sale.customerName}`, 140, 45);
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      doc.text(`Phone: ${customer.phone}`, 140, 50);
    }

    const tableData = sale.items.map((item: any) => [
      item.productName,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: 60,
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Subtotal: $${sale.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Tax: $${sale.tax.toFixed(2)}`, 140, finalY + 5);
    doc.text(`Discount: $${sale.discount.toFixed(2)}`, 140, finalY + 10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${sale.totalAmount.toFixed(2)}`, 140, finalY + 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paid: $${sale.paidAmount.toFixed(2)}`, 140, finalY + 25);
    doc.text(`Due: $${sale.dueAmount.toFixed(2)}`, 140, finalY + 30);

    doc.save(`invoice_${sale.invoiceId}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
          <p className="text-zinc-500 mt-1">Review all past transactions and reprint invoices.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by invoice, customer or seller..." 
                className="pl-10 h-11 rounded-xl" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <TableCell className="font-bold">{sale.invoiceId}</TableCell>
                    <TableCell className="text-zinc-500 text-xs">
                      {format(new Date(sale.date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-zinc-400" />
                        <span className="text-sm font-medium">{sale.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                        {sale.sellerName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${sale.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.dueAmount > 0 ? (
                        <Badge variant="outline" className="text-red-500 border-red-100 dark:border-red-900/30">Partial</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-500 border-green-100 dark:border-green-900/30">Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onClick={() => {
                            setSelectedSale(sale);
                            setIsDetailsOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generateInvoicePDF(sale)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Bill
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      No sales records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Invoice Details
            </DialogTitle>
            <DialogDescription>Transaction summary for {selectedSale?.invoiceId}</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Customer</p>
                  <p className="font-bold">{selectedSale.customerName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Date</p>
                  <p className="font-bold">{format(new Date(selectedSale.date), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Items Purchased</p>
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{item.productName} x {item.quantity}</span>
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax</span>
                  <span>${selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Discount</span>
                  <span>-${selectedSale.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span>${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-zinc-500">Paid Amount</span>
                  <span className="text-green-600 font-bold">${selectedSale.paidAmount.toFixed(2)}</span>
                </div>
                {selectedSale.dueAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Remaining Due</span>
                    <span className="text-red-500 font-bold">${selectedSale.dueAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-xl" onClick={() => generateInvoicePDF(selectedSale)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistory;
