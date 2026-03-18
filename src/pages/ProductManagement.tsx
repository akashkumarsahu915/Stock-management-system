
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct,
  addLog 
} from '../store/stockSlice';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  Package,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Product, ProductFeature } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProductManagement: React.FC = () => {
  const { products, categories } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    supplier: '',
    features: [] as ProductFeature[],
  });

  const addFeatureField = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { key: '', value: '' }]
    });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeatureField = (index: number, field: 'key' | 'value', value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = formData.price || 0;
    const quantity = formData.quantity || 0;

    if (!formData.name || !formData.category || price < 0 || quantity < 0) {
      toast.error('Please fill all fields correctly');
      return;
    }

    dispatch(addProduct({ ...formData, price, quantity }));
    dispatch(addLog({
      userId: user?.id || '',
      userName: user?.name || '',
      action: 'PRODUCT_MANAGEMENT',
      details: `Added new product: ${formData.name}`,
      type: 'PRODUCT_MANAGEMENT'
    }));
    
    setIsAddDialogOpen(false);
    setFormData({ name: '', category: '', price: 0, quantity: 0, supplier: '', features: [] });
    toast.success('Product added successfully');
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const price = formData.price || 0;
    const quantity = formData.quantity || 0;

    dispatch(updateProduct({
      ...selectedProduct,
      ...formData,
      price,
      quantity
    }));

    dispatch(addLog({
      userId: user?.id || '',
      userName: user?.name || '',
      action: 'PRODUCT_MANAGEMENT',
      details: `Updated product: ${formData.name}`,
      type: 'PRODUCT_MANAGEMENT'
    }));

    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    toast.success('Product updated successfully');
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    dispatch(deleteProduct(selectedProduct.id));
    dispatch(addLog({
      userId: user?.id || '',
      userName: user?.name || '',
      action: 'PRODUCT_MANAGEMENT',
      details: `Deleted product: ${selectedProduct.name}`,
      type: 'PRODUCT_MANAGEMENT'
    }));

    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
    toast.success('Product deleted successfully');
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      supplier: product.supplier,
      features: product.features || [],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Price', 'Quantity', 'Supplier', 'Status', 'Last Updated'];
    const rows = products.map(p => [
      p.id, p.name, p.category, p.price, p.quantity, p.supplier, p.status, p.lastUpdated
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting product list...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage your inventory, add new products and track stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} className="hidden sm:flex border-primary/20 hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details to add a new product to your inventory.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. MacBook Pro" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData({...formData, category: v})}
                    >
                      <SelectTrigger className="border-primary/20 focus-visible:ring-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input 
                      id="supplier" 
                      placeholder="Apple Inc." 
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      required
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={isNaN(formData.price) ? "" : formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value === "" ? NaN : parseFloat(e.target.value)})}
                      required
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Initial Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="0"
                      value={isNaN(formData.quantity) ? "" : formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value === "" ? NaN : parseInt(e.target.value)})}
                      required
                      className="border-primary/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Features / Variants</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={addFeatureField} className="h-7 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary">
                        <Plus className="w-3 h-3 mr-1" /> Add Feature
                      </Button>
                    </div>
                    <Separator className="bg-border" />
                    <ScrollArea className="max-h-[150px] pr-4">
                      <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <Input 
                              placeholder="Feature (e.g. Color)" 
                              className="h-9 text-xs border-primary/20 focus-visible:ring-primary"
                              value={feature.key}
                              onChange={(e) => updateFeatureField(index, 'key', e.target.value)}
                            />
                            <Input 
                              placeholder="Value (e.g. Red)" 
                              className="h-9 text-xs border-primary/20 focus-visible:ring-primary"
                              value={feature.value}
                              onChange={(e) => updateFeatureField(index, 'value', e.target.value)}
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                              onClick={() => removeFeatureField(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {formData.features.length === 0 && (
                          <p className="text-xs text-center text-muted-foreground py-4 italic">No features added yet</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or supplier..." 
                className="pl-10 border-primary/20 focus-visible:ring-primary" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] border-primary/20 focus-visible:ring-primary">
                  <Filter className="w-4 h-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-primary/20 focus-visible:ring-primary">
                  <ArrowUpDown className="w-4 h-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[300px] cursor-pointer text-foreground" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Product
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-foreground">Category</TableHead>
                <TableHead className="cursor-pointer text-foreground" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">
                    Price
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-foreground" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center gap-2">
                    Quantity
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Last Updated</TableHead>
                {user?.role === 'ADMIN' && <TableHead className="text-right text-foreground">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length > 0 ? currentProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.supplier}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">${product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      product.quantity === 0 ? "text-destructive" : product.quantity < 10 ? "text-amber-600" : "text-foreground"
                    )}>
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "border-none",
                      product.status === 'IN_STOCK' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      product.status === 'LOW_STOCK' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      product.status === 'OUT_OF_STOCK' && "bg-red-500/10 text-red-600 dark:text-red-400",
                    )}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(product.lastUpdated), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  {user?.role === 'ADMIN' && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => openEditDialog(product)} className="hover:bg-primary/10 hover:text-primary">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={user?.role === 'ADMIN' ? 7 : 6} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 mb-4 opacity-20" />
                      <p>No products found matching your criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-primary/20 hover:bg-primary/5" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button 
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-xs",
                      currentPage === page ? "bg-primary text-primary-foreground" : "border-primary/20 hover:bg-primary/5"
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-primary/20 hover:bg-primary/5" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the details for this product.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input 
                  id="edit-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({...formData, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input 
                  id="edit-supplier" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={isNaN(formData.price) ? "" : formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value === "" ? NaN : parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input 
                  id="edit-quantity" 
                  type="number" 
                  min="0"
                  value={isNaN(formData.quantity) ? "" : formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value === "" ? NaN : parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Product Features / Variants</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addFeatureField} className="h-7 text-[10px] font-bold uppercase tracking-wider">
                    <Plus className="w-3 h-3 mr-1" /> Add Feature
                  </Button>
                </div>
                <Separator />
                <ScrollArea className="max-h-[150px] pr-4">
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <Input 
                          placeholder="Feature (e.g. Color)" 
                          className="h-9 text-xs"
                          value={feature.key}
                          onChange={(e) => updateFeatureField(index, 'key', e.target.value)}
                        />
                        <Input 
                          placeholder="Value (e.g. Red)" 
                          className="h-9 text-xs"
                          value={feature.value}
                          onChange={(e) => updateFeatureField(index, 'value', e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFeatureField(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.features.length === 0 && (
                      <p className="text-xs text-center text-zinc-500 py-4 italic">No features added yet</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
