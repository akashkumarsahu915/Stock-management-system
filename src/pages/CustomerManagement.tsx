
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addCustomer, updateCustomer, deleteCustomer, updateDuePayment } from '../store/stockSlice';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  History,
  CreditCard,
  ChevronRight,
  Filter
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
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Customer } from '../types';

const CustomerManagement: React.FC = () => {
  const { customers, sales } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.phone.includes(searchTerm) || 
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDue = filterDueOnly ? c.pendingDue > 0 : true;
    return matchesSearch && matchesDue;
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    dispatch(addCustomer(formData));
    toast.success('Customer added successfully');
    setIsAddDialogOpen(false);
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      dispatch(updateCustomer({ ...selectedCustomer, ...formData }));
      toast.success('Customer updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    dispatch(deleteCustomer(id));
    toast.success('Customer deleted successfully');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && paymentAmount > 0) {
      if (paymentAmount > selectedCustomer.pendingDue) {
        toast.error('Payment exceeds pending due');
        return;
      }
      dispatch(updateDuePayment({
        customerId: selectedCustomer.id,
        amountPaid: paymentAmount,
        userId: user?.id || '',
        userName: user?.name || ''
      }));
      toast.success('Payment recorded successfully');
      setIsPaymentDialogOpen(false);
      setPaymentAmount(0);
      setSelectedCustomer(null);
    }
  };

  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(s => s.customerId === selectedCustomer.id);
  }, [selectedCustomer, sales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500 mt-1">Manage your customer relationships and track dues.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter customer details to create a new profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Maple St, City" />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">Create Customer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by name, phone or email..." 
                className="pl-10 h-11 rounded-xl" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={filterDueOnly ? "default" : "outline"} 
                className={cn("h-11 rounded-xl px-4", filterDueOnly && "bg-red-500 hover:bg-red-600 text-white border-none")}
                onClick={() => setFilterDueOnly(!filterDueOnly)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterDueOnly ? "Showing Dues Only" : "Filter by Due"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Pending Due</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{customer.name}</p>
                          <p className="text-xs text-zinc-500">Joined {format(new Date(customer.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {customer.address || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${customer.totalPurchases.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.pendingDue > 0 ? (
                        <Badge className="bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                          ${customer.pendingDue.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-100 dark:text-green-400 dark:border-green-900/30">
                          Paid
                        </Badge>
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
                            setSelectedCustomer(customer);
                            setIsHistoryDialogOpen(true);
                          }}>
                            <History className="w-4 h-4 mr-2" />
                            Purchase History
                          </DropdownMenuItem>
                          {customer.pendingDue > 0 && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedCustomer(customer);
                              setPaymentAmount(customer.pendingDue);
                              setIsPaymentDialogOpen(true);
                            }}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedCustomer(customer);
                            setFormData({
                              name: customer.name,
                              phone: customer.phone,
                              email: customer.email,
                              address: customer.address
                            });
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteCustomer(customer.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for {selectedCustomer?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-6 py-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total Pending Due</span>
                <span className="font-bold text-red-500">${selectedCustomer?.pendingDue.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  id="payment-amount" 
                  type="number" 
                  className="pl-10 h-12 text-xl font-bold" 
                  value={isNaN(paymentAmount) ? "" : paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value === "" ? NaN : parseFloat(e.target.value))}
                  max={selectedCustomer?.pendingDue}
                />
              </div>
              <p className="text-xs text-zinc-500">Remaining after payment: ${(selectedCustomer?.pendingDue || 0) - paymentAmount}</p>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">Confirm Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
            <DialogDescription>Viewing all transactions for {selectedCustomer?.name}.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-4 pr-4">
              {customerSales.length > 0 ? customerSales.map(sale => (
                <div key={sale.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{sale.invoiceId}</p>
                      <p className="text-xs text-zinc-500">{format(new Date(sale.date), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <Badge variant="secondary" className="font-bold">${sale.totalAmount.toFixed(2)}</Badge>
                  </div>
                  <div className="space-y-1">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400">{item.productName} x {item.quantity}</span>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Paid: ${sale.paidAmount.toFixed(2)}</span>
                    <span className={cn("font-bold", sale.dueAmount > 0 ? "text-red-500" : "text-green-500")}>
                      Due: ${sale.dueAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-500">
                  No purchase history found.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
