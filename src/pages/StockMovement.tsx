
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Search, 
  Filter,
  Package,
  User,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const StockMovement: React.FC = () => {
  const { stockLogs } = useSelector((state: RootState) => state.stock);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return stockLogs.filter(log => {
      const matchesSearch = log.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = actionFilter === 'ALL' ? true : log.actionType === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [stockLogs, searchTerm, actionFilter]);

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'ADDED':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30">Added</Badge>;
      case 'INCREASED':
        return <Badge className="bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">Increased</Badge>;
      case 'DECREASED':
        return <Badge className="bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30">Decreased</Badge>;
      case 'SALES_DEDUCTION':
        return <Badge className="bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">Sales Deduction</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ADDED':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'INCREASED':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'DECREASED':
        return <ArrowDownRight className="w-4 h-4 text-orange-500" />;
      case 'SALES_DEDUCTION':
        return <ShoppingCart className="w-4 h-4 text-red-500" />;
      default:
        return <History className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
          <p className="text-zinc-500 mt-1">Detailed history of all stock changes and movements.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by product or user..." 
                className="pl-10 h-11 rounded-xl" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="ADDED">Added</SelectItem>
                  <SelectItem value="INCREASED">Increased</SelectItem>
                  <SelectItem value="DECREASED">Decreased</SelectItem>
                  <SelectItem value="SALES_DEDUCTION">Sales Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Quantity Changed</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Package className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-bold text-sm">{log.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.actionType)}
                        {getActionBadge(log.actionType)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {log.actionType === 'DECREASED' || log.actionType === 'SALES_DEDUCTION' ? '-' : '+'}
                      {log.quantityChanged}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <User className="h-3 w-3" />
                        {log.userName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-zinc-500">
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                      No stock movement logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovement;
