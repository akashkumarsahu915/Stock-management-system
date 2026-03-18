
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const { products, logs } = useSelector((state: RootState) => state.stock);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Filter products assigned to this seller (or all if not implemented assignment yet)
  const myProducts = products; 
  const totalProducts = myProducts.length;
  const lowStockProducts = myProducts.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK');
  const outOfStockCount = myProducts.filter(p => p.status === 'OUT_OF_STOCK').length;

  const myLogs = logs.filter(log => log.userId === user?.id).slice(0, 5);

  const stats = [
    { 
      title: 'Assigned Products', 
      value: totalProducts, 
      icon: Package, 
      color: 'blue'
    },
    { 
      title: 'Low Stock Items', 
      value: lowStockProducts.length, 
      icon: AlertTriangle, 
      color: 'amber'
    },
    { 
      title: 'Out of Stock', 
      value: outOfStockCount, 
      icon: TrendingUp, 
      color: 'red'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned inventory and update stock levels.</p>
        </div>
        <Button onClick={() => navigate('/seller/products')} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Update Stock
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-xl",
                  stat.color === 'blue' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  stat.color === 'amber' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  stat.color === 'red' && "bg-red-500/10 text-red-600 dark:text-red-400",
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
              <CardDescription>Items that need stock updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs hover:bg-primary/10 hover:text-primary" onClick={() => navigate('/seller/products')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      product.status === 'OUT_OF_STOCK' ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      product.status === 'OUT_OF_STOCK' ? "text-red-600" : "text-amber-600"
                    )}>
                      {product.quantity} left
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary" onClick={() => navigate('/seller/products')}>
                      Update
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm">Great job! All your items are well stocked.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Activity */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">My Activity</CardTitle>
              <CardDescription>Your recent stock updates</CardDescription>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {myLogs.length > 0 ? myLogs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Stock Updated
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent activity found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
