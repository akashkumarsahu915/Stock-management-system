
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  addSeller, 
  removeSeller,
  addLog 
} from '../store/stockSlice';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  User,
  Mail,
  Shield,
  UserPlus
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const SellerManagement: React.FC = () => {
  const { sellers } = useSelector((state: RootState) => state.stock);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please fill all fields');
      return;
    }

    dispatch(addSeller(formData));
    dispatch(addLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      action: 'USER_MANAGEMENT',
      details: `Added new seller: ${formData.name}`,
      type: 'USER_MANAGEMENT'
    }));

    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '' });
    toast.success('Seller added successfully');
  };

  const handleDeleteSeller = () => {
    if (!selectedSeller) return;

    dispatch(removeSeller(selectedSeller.id));
    dispatch(addLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      action: 'USER_MANAGEMENT',
      details: `Removed seller: ${selectedSeller.name}`,
      type: 'USER_MANAGEMENT'
    }));

    setIsDeleteDialogOpen(false);
    setSelectedSeller(null);
    toast.success('Seller removed successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Seller Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your team of sellers and their access to the system.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Seller
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add New Seller</DialogTitle>
              <DialogDescription>Create a new seller account for your team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSeller} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="seller-name">Full Name</Label>
                <Input 
                  id="seller-name" 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-email">Email Address</Label>
                <Input 
                  id="seller-email" 
                  type="email"
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
                <p className="text-xs text-zinc-500">Default password for new sellers: <strong>Seller@123</strong></p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search sellers by name or email..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
              <TableHead>Seller</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.length > 0 ? filteredSellers.map((seller) => (
              <TableRow key={seller.id} className="border-zinc-100 dark:border-zinc-800">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                      {seller.name.charAt(0)}
                    </div>
                    <span className="font-medium">{seller.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500">{seller.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal uppercase tracking-wider text-[10px]">
                    {seller.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {}}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Shield className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedSeller(seller);
                          setIsDeleteDialogOpen(true);
                        }} 
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Seller
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <User className="w-10 h-10 mb-2 opacity-20" />
                    <p>No sellers found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remove Seller</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedSeller?.name}</strong>? They will lose access to the system immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSeller}>Remove Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerManagement;
