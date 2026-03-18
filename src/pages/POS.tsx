
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Receipt,
  Package,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { addSale, addCustomer } from '../store/stockSlice';
import { SaleItem } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const POS: React.FC = () => {
  const { products, customers, sellers } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedSellerId, setSelectedSellerId] = useState<string>(user?.id || '');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // 5% default tax
  const [amountPaid, setAmountPaid] = useState(0);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  const handleQuickAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and phone are required');
      return;
    }
    dispatch(addCustomer(newCustomer));
    toast.success('Customer added successfully');
    setIsAddingCustomer(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
  };

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.quantity > 0;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
    c.phone.includes(customerSearchTerm)
  );

  const subtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + item.total, 0)
  , [cart]);

  const taxAmount = useMemo(() => (subtotal * (taxRate || 0)) / 100, [subtotal, taxRate]);
  const totalAmount = useMemo(() => subtotal + taxAmount - (discount || 0), [subtotal, taxAmount, discount]);
  const dueAmount = useMemo(() => Math.max(0, totalAmount - (amountPaid || 0)), [totalAmount, amountPaid]);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('Cannot add more than available stock');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.quantity) {
          toast.error('Exceeds available stock');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const generateInvoicePDF = (sale: any) => {
    const doc = new jsPDF();
    
    // Header
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

    // Table
    const tableData = sale.items.map((item: any) => [
      item.productName,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Subtotal: $${sale.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Tax (${taxRate}%): $${sale.tax.toFixed(2)}`, 140, finalY + 5);
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

  const handleCheckout = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    
    const seller = user?.role === 'ADMIN' 
      ? (sellers.find(s => s.id === selectedSellerId) || user)
      : user;
    
    const saleData = {
      sellerId: seller?.id || '',
      sellerName: seller?.name || '',
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Unknown',
      items: cart,
      subtotal,
      discount: discount || 0,
      tax: taxAmount,
      totalAmount,
      paidAmount: amountPaid || 0,
      dueAmount
    };

    dispatch(addSale(saleData));
    toast.success('Sale completed successfully!');
    
    // Reset
    setCart([]);
    setSelectedCustomerId('');
    setDiscount(0);
    setAmountPaid(0);

    // Ask to print
    const shouldPrint = true; // Default to true or use a custom dialog
    if (shouldPrint) {
      // We don't have the ID yet because it's generated in the slice, 
      // but we can mock it for the PDF generation here or get it from the state.
      // For simplicity, let's just generate a PDF with the current data.
      generateInvoicePDF({
        ...saleData,
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Point of Sale</h1>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-10 bg-card border-border rounded-xl focus:ring-primary" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto no-scrollbar">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 py-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group cursor-pointer flex flex-col rounded-2xl border border-border hover:border-primary transition-all bg-card shadow-sm hover:shadow-md overflow-hidden relative"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img 
                      src={`https://picsum.photos/seed/${product.id}/400/400`} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg h-8">
                        <Plus className="w-3 h-3 mr-1" /> Add to Cart
                      </Button>
                    </div>
                    {product.quantity <= 5 && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-destructive text-destructive-foreground border-none text-[8px] font-bold px-1.5 py-0.5">
                          Low Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-xs line-clamp-2 leading-tight flex-1 text-foreground">{product.name}</h3>
                      <span className="text-primary font-black text-sm">${product.price}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">{product.category}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{product.quantity} left</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No products found in this category</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-full lg:w-[380px] flex flex-col gap-4 h-full">
        <Card className="flex-1 border-none shadow-lg bg-card flex flex-col overflow-hidden rounded-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Order Details</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none font-bold">
                  {cart.length} items
                </Badge>
                {cart.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setCart([])}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Customer Information</Label>
                <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold text-primary hover:text-primary/80 hover:bg-primary/10">
                      <Plus className="w-3 h-3 mr-1" /> New Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. John Doe"
                          value={newCustomer.name} 
                          onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input 
                          id="phone" 
                          placeholder="e.g. +1 234 567 890"
                          value={newCustomer.phone} 
                          onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Input 
                          id="address" 
                          placeholder="e.g. 123 Main St"
                          value={newCustomer.address} 
                          onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCustomer(false)} className="rounded-xl">Cancel</Button>
                      <Button onClick={handleQuickAddCustomer} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Save Customer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search customer..." 
                    className="pl-9 h-10 text-xs rounded-xl bg-muted/50 border-none"
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value);
                      if (selectedCustomerId) setSelectedCustomerId('');
                    }}
                  />
                  {customerSearchTerm && !selectedCustomerId && (
                    <Card className="absolute z-50 w-full mt-1 shadow-2xl border-border max-h-[240px] overflow-auto rounded-xl p-1 bg-card">
                      {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                        <div 
                          key={c.id} 
                          className="flex items-center justify-between p-2.5 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setCustomerSearchTerm(c.name);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.phone}</p>
                          </div>
                          {c.pendingDue > 0 && (
                            <Badge className="bg-destructive/10 text-destructive border-none text-[8px] h-4">
                              Due: ${c.pendingDue}
                            </Badge>
                          )}
                        </div>
                      )) : (
                        <div className="p-4 text-[10px] text-center text-muted-foreground">
                          No results. <button onClick={() => setIsAddingCustomer(true)} className="text-primary font-bold ml-1">Add New?</button>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {selectedCustomerId && (
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{customers.find(c => c.id === selectedCustomerId)?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{customers.find(c => c.id === selectedCustomerId)?.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setSelectedCustomerId('');
                        setCustomerSearchTerm('');
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Attributed Seller</Label>
                <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
                  <SelectTrigger className="rounded-xl h-10 bg-muted/50 border-none">
                    <SelectValue placeholder="Select a seller" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={user.id}>Me ({user.name})</SelectItem>
                    {sellers.filter(s => s.id !== user.id).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-2">Cart Items</Label>
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-3 pb-4">
                  {cart.length > 0 ? cart.map(item => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.productId} 
                      className="flex items-center gap-3 group bg-muted/30 p-2 rounded-xl border border-transparent hover:border-border transition-all"
                    >
                      <div className="h-12 w-12 rounded-lg bg-card overflow-hidden border border-border">
                        <img 
                          src={`https://picsum.photos/seed/${item.productId}/100/100`} 
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">${item.price} per unit</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-lg border-border"
                          onClick={() => updateCartQuantity(item.productId, -1)}
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </Button>
                        <span className="text-xs font-black w-4 text-center text-foreground">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-lg border-border"
                          onClick={() => updateCartQuantity(item.productId, 1)}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ShoppingCart className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-xs font-medium">Cart is currently empty</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-border">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="text-foreground font-bold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground font-medium">Discount ($)</span>
                <Input 
                  type="number" 
                  className="h-7 w-20 text-right text-xs font-bold rounded-lg bg-muted border-none" 
                  value={isNaN(discount) ? "" : discount}
                  onChange={(e) => setDiscount(e.target.value === "" ? NaN : parseFloat(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
                <span className="text-sm font-black uppercase tracking-wider text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 bg-muted/50 p-6">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Received</Label>
                {dueAmount > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-none text-[10px] font-bold">
                    Due: ${dueAmount.toFixed(2)}
                  </Badge>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <CreditCard className="h-full w-full" />
                </div>
                <Input 
                  type="number" 
                  className="pl-12 pr-24 h-14 text-2xl font-black rounded-2xl bg-card border-border focus:ring-4 focus:ring-primary/10 transition-all text-foreground" 
                  placeholder="0.00"
                  value={isNaN(amountPaid) ? "" : amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value === "" ? NaN : parseFloat(e.target.value))}
                />
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 rounded-lg"
                  onClick={() => setAmountPaid(totalAmount)}
                >
                  Full Pay
                </Button>
              </div>
            </div>
            <Button 
              className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
              onClick={handleCheckout}
            >
              <Receipt className="w-5 h-5 mr-2" />
              Complete Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default POS;
