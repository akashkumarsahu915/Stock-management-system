
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { products, logs, sellers } = useSelector((state: RootState) => state.stock);

  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const lowStockProducts = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK');
  const outOfStockCount = products.filter(p => p.status === 'OUT_OF_STOCK').length;

  const categoryData = products.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.quantity;
    } else {
      acc.push({ name: p.category, value: p.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const recentLogs = logs.slice(0, 5);

  const stats = [
    { 
      title: 'Total Products', 
      value: totalProducts, 
      icon: Package, 
      trend: '+12%', 
      trendUp: true,
      color: 'blue'
    },
    { 
      title: 'Stock Value', 
      value: `$${totalStockValue.toLocaleString()}`, 
      icon: DollarSign, 
      trend: '+8%', 
      trendUp: true,
      color: 'emerald'
    },
    { 
      title: 'Low Stock Items', 
      value: lowStockProducts.length, 
      icon: AlertTriangle, 
      trend: '-2%', 
      trendUp: false,
      color: 'amber'
    },
    { 
      title: 'Out of Stock', 
      value: outOfStockCount, 
      icon: TrendingUp, 
      trend: '+5%', 
      trendUp: true,
      color: 'red'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-xl",
                  stat.color === 'blue' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  stat.color === 'amber' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  stat.color === 'red' && "bg-red-500/10 text-red-600 dark:text-red-400",
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  stat.trendUp ? "text-emerald-600" : "text-red-600"
                )}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.trend}
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
        {/* Inventory Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Inventory by Category</CardTitle>
            <CardDescription>Distribution of stock quantities across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest stock updates and actions</CardDescription>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                      log.type === 'STOCK_UPDATE' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {log.type === 'STOCK_UPDATE' ? <Package className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.userName}
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
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Table */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
            <CardDescription>Products that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      product.status === 'OUT_OF_STOCK' ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={product.status === 'OUT_OF_STOCK' ? 'destructive' : 'outline'} className={cn(
                      product.status === 'LOW_STOCK' && "border-amber-500 text-amber-600"
                    )}>
                      {product.quantity} left
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">All products are well stocked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sellers Summary */}
        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Sellers</CardTitle>
            <CardDescription>Manage your team of stock managers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div key={seller.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                      {seller.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">{seller.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    Seller
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs border-primary/20 hover:bg-primary/5" onClick={() => {}}>
                Manage All Sellers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
