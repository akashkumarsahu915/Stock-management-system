
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  History, 
  Search, 
  Filter, 
  Package, 
  User, 
  Settings,
  ArrowUpDown,
  Clock,
  Building2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const ActivityLogs: React.FC = () => {
  const { logs } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // If seller, only show their logs
  const filteredLogs = logs.filter(log => {
    const isOwner = user?.role === 'ADMIN' || log.userId === user?.id;
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return isOwner && matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Activity Logs</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Track all stock updates and system changes.</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2 opacity-50" />
                <SelectValue placeholder="All Activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="STOCK_UPDATE">Stock Updates</SelectItem>
                <SelectItem value="PRODUCT_MANAGEMENT">Product Changes</SelectItem>
                <SelectItem value="SUPPLIER">Supplier Payments</SelectItem>
                <SelectItem value="USER_MANAGEMENT">User Management</SelectItem>
                <SelectItem value="SYSTEM">System Logs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-zinc-100 dark:border-zinc-800">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      {log.userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{log.userName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {log.type === 'STOCK_UPDATE' && <Package className="w-3 h-3 text-blue-500" />}
                    {log.type === 'PRODUCT_MANAGEMENT' && <ArrowUpDown className="w-3 h-3 text-emerald-500" />}
                    {log.type === 'SUPPLIER' && <Building2 className="w-3 h-3 text-indigo-500" />}
                    {log.type === 'USER_MANAGEMENT' && <User className="w-3 h-3 text-amber-500" />}
                    {log.type === 'SYSTEM' && <Settings className="w-3 h-3 text-zinc-500" />}
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[400px]">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{log.details}</p>
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className={cn(
                    "text-[10px] uppercase tracking-wider",
                    log.type === 'STOCK_UPDATE' && "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
                    log.type === 'PRODUCT_MANAGEMENT' && "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                    log.type === 'SUPPLIER' && "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
                    log.type === 'USER_MANAGEMENT' && "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                  )}>
                    {log.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p>No activity logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ActivityLogs;
