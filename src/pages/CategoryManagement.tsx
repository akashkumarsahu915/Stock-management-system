
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  addCategory, 
  deleteCategory,
  addLog 
} from '../store/stockSlice';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tags,
  MoreVertical,
  Package
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const CategoryManagement: React.FC = () => {
  const { categories, products } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    dispatch(addCategory(formData));
    dispatch(addLog({
      userId: user?.id || '',
      userName: user?.name || '',
      action: 'SYSTEM',
      details: `Added new category: ${formData.name}`,
      type: 'SYSTEM'
    }));

    setIsAddDialogOpen(false);
    setFormData({ name: '', description: '' });
    toast.success('Category added successfully');
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    // Check if category has products
    const hasProducts = products.some(p => p.category === selectedCategory.name);
    if (hasProducts) {
      toast.error('Cannot delete category with existing products');
      setIsDeleteDialogOpen(false);
      return;
    }

    dispatch(deleteCategory(selectedCategory.id));
    dispatch(addLog({
      userId: user?.id || '',
      userName: user?.name || '',
      action: 'SYSTEM',
      details: `Deleted category: ${selectedCategory.name}`,
      type: 'SYSTEM'
    }));

    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
    toast.success('Category deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Category Management</h1>
          <p className="text-muted-foreground">Organize your products into logical groups.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category for your products.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input 
                  id="cat-name" 
                  placeholder="e.g. Home Appliances" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description (Optional)</Label>
                <Input 
                  id="cat-desc" 
                  placeholder="Brief description..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search categories..." 
              className="pl-10 border-primary/20 focus-visible:ring-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const productCount = products.filter(p => p.category === category.name).length;
          return (
            <Card key={category.id} className="border-none shadow-sm bg-card overflow-hidden group hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Tags className="w-6 h-6 text-primary" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description || 'No description provided'}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-medium">{productCount} Products</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground">
                    Category
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
