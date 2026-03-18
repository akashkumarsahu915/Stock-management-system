
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  updateStock,
  addLog 
} from '../store/stockSlice';
import { 
  Search, 
  Filter, 
  Package, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SellerProductManagement: React.FC = () => {
  const { products, categories } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || newQuantity < 0) {
      toast.error('Invalid quantity');
      return;
    }

    dispatch(updateStock({
      id: selectedProduct.id,
      quantity: newQuantity,
      userId: user?.id || '',
      userName: user?.name || ''
    }));

    setIsUpdateDialogOpen(false);
    setSelectedProduct(null);
    toast.success(`Stock updated for ${selectedProduct.name}`);
  };

  const openUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantity);
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">My Products</h1>
        <p className="text-zinc-500 dark:text-zinc-400">View and update stock levels for your assigned products.</p>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search products..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2 opacity-50" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length > 0 ? currentProducts.map((product) => (
                <TableRow key={product.id} className="border-zinc-100 dark:border-zinc-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{product.supplier}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold text-lg",
                      product.quantity === 0 ? "text-red-600" : product.quantity < 10 ? "text-amber-600" : "text-zinc-900 dark:text-zinc-100"
                    )}>
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "border-none",
                      product.status === 'IN_STOCK' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                      product.status === 'LOW_STOCK' && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                      product.status === 'OUT_OF_STOCK' && "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
                    )}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs">
                    {format(new Date(product.lastUpdated), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openUpdateDialog(product)}
                      className="hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Update Stock
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 mb-4 opacity-20" />
                      <p>No products assigned to you yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Update the current quantity for <strong>{selectedProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="stock-qty" className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold">New Quantity</Label>
              <div className="flex items-center gap-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-full"
                  onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Input 
                  id="stock-qty" 
                  type="number" 
                  min="0"
                  className="w-24 h-16 text-3xl font-bold text-center border-none bg-zinc-50 dark:bg-zinc-800 rounded-2xl"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  required
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-full"
                  onClick={() => setNewQuantity(newQuantity + 1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Confirm Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerProductManagement;
