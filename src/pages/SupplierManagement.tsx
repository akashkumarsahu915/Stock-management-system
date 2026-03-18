
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addSupplier, updateSupplier, deleteSupplier, updateSupplierPayment } from '../store/stockSlice';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Package,
  ChevronRight,
  Filter,
  CreditCard,
  DollarSign,
  History
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
import { Supplier } from '../types';

const SupplierManagement: React.FC = () => {
  const { suppliers, products } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      toast.error('Name and Company are required');
      return;
    }
    dispatch(addSupplier(formData));
    toast.success('Supplier added successfully');
    setIsAddDialogOpen(false);
    setFormData({ name: '', company: '', phone: '', email: '', address: '' });
  };

  const handleEditSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier) {
      dispatch(updateSupplier({ ...selectedSupplier, ...formData }));
      toast.success('Supplier updated successfully');
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleDeleteSupplier = (id: string) => {
    dispatch(deleteSupplier(id));
    toast.success('Supplier deleted successfully');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (paymentAmount > selectedSupplier.pendingBalance) {
      toast.error('Payment amount cannot exceed pending balance');
      return;
    }

    dispatch(updateSupplierPayment({
      supplierId: selectedSupplier.id,
      amountPaid: paymentAmount,
      userId: user?.id || 'system',
      userName: user?.name || 'System'
    }));

    toast.success(`Payment of $${paymentAmount} recorded for ${selectedSupplier.name}`);
    setIsPaymentDialogOpen(false);
    setPaymentAmount(0);
    setSelectedSupplier(null);
  };

  const supplierProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return products.filter(p => p.supplier === selectedSupplier.name || p.supplier === selectedSupplier.company);
  }, [selectedSupplier, products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-zinc-500 mt-1">Manage your product suppliers and track their inventory.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Enter supplier details to create a new profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Apple Inc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="sales@apple.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Cupertino, CA" />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">Create Supplier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by name, company or email..." 
              className="pl-10 h-11 rounded-xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Financials</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{supplier.name}</p>
                          <p className="text-xs text-zinc-500">Added {format(new Date(supplier.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold">{supplier.company}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Paid</span>
                          <span className="text-xs font-bold text-emerald-600">${supplier.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Balance</span>
                          <span className={cn(
                            "text-xs font-bold",
                            supplier.pendingBalance > 0 ? "text-red-500" : "text-zinc-400"
                          )}>
                            ${supplier.pendingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {supplier.address || 'N/A'}
                      </div>
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
                            setSelectedSupplier(supplier);
                            setIsProductsDialogOpen(true);
                          }}>
                            <Package className="w-4 h-4 mr-2" />
                            Supplied Products
                          </DropdownMenuItem>
                          {supplier.pendingBalance > 0 && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedSupplier(supplier);
                              setPaymentAmount(supplier.pendingBalance);
                              setIsPaymentDialogOpen(true);
                            }}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedSupplier(supplier);
                            setFormData({
                              name: supplier.name,
                              company: supplier.company,
                              phone: supplier.phone,
                              email: supplier.email,
                              address: supplier.address
                            });
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteSupplier(supplier.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Supplier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record Supplier Payment</DialogTitle>
            <DialogDescription>
              Record a payment made to {selectedSupplier?.company}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Pending Balance</span>
                <span className="font-bold text-red-500">${selectedSupplier?.pendingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Total Paid to Date</span>
                <span className="font-bold text-emerald-600">${selectedSupplier?.totalPaid.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  id="payment-amount" 
                  type="number" 
                  value={paymentAmount || ''} 
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="pl-10 h-12 text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handlePayment}
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold"
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier Profile</DialogTitle>
            <DialogDescription>Update supplier information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSupplier} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Contact Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Name</Label>
              <Input id="edit-company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
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

      {/* Products Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Supplied Products</DialogTitle>
            <DialogDescription>Products supplied by {selectedSupplier?.company}.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-3 pr-4">
              {supplierProducts.length > 0 ? supplierProducts.map(product => (
                <div key={product.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${product.price}</p>
                    <p className="text-xs text-zinc-500">{product.quantity} in stock</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-500">
                  No products found for this supplier.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
