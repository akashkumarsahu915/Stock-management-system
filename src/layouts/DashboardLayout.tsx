
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { markNotificationRead, markAllNotificationsRead, clearNotifications } from '../store/stockSlice';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  Sun,
  Moon,
  Package2,
  ChevronRight,
  Tags,
  ShoppingCart,
  UserCircle,
  Truck,
  FileText,
  BarChart3,
  Activity,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const { user } = useSelector((state: RootState) => state.auth);
  const { products, customers, sales, notifications } = useSelector((state: RootState) => state.stock);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const lowStockCount = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').length;
  const dueCustomersCount = customers.filter(c => c.pendingDue > 0).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = user?.role === 'ADMIN' ? [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'POS / Sales', icon: ShoppingCart, path: '/admin/pos' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Categories', icon: Tags, path: '/admin/categories' },
    { name: 'Customers', icon: UserCircle, path: '/admin/customers' },
    { name: 'Suppliers', icon: Truck, path: '/admin/suppliers' },
    { name: 'Sellers', icon: Users, path: '/admin/sellers' },
    { name: 'Sales History', icon: FileText, path: '/admin/sales-history' },
    { name: 'Stock Movement', icon: Activity, path: '/admin/stock-movement' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { name: 'System Logs', icon: History, path: '/admin/logs' },
  ] : [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/seller' },
    { name: 'POS / Sales', icon: ShoppingCart, path: '/seller/pos' },
    { name: 'Inventory', icon: Package, path: '/seller/products' },
    { name: 'Customers', icon: UserCircle, path: '/seller/customers' },
    { name: 'Sales History', icon: FileText, path: '/seller/sales-history' },
    { name: 'Activity History', icon: History, path: '/seller/logs' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
        !isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <Package2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">StockMaster</span>
          </div>

          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-1 py-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent hover:bg-opacity-50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-primary-foreground" : "text-primary")} />
                  {item.name}
                  {location.pathname === item.path && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role.toLowerCase()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex relative w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, orders..." 
                className="pl-10 bg-muted/50 border-none focus-visible:ring-1" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    <div className="flex items-center gap-2">
                      {unreadNotificationsCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider hover:text-primary"
                          onClick={() => dispatch(markAllNotificationsRead())}
                        >
                          Mark all read
                        </Button>
                      )}
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{unreadNotificationsCount}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[350px]">
                    <div className="p-2 space-y-1">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                              n.read ? "opacity-60" : "bg-muted/50 hover:bg-muted"
                            )}
                            onClick={() => {
                              dispatch(markNotificationRead(n.id));
                              if (n.actionLink) navigate(n.actionLink);
                            }}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              n.type === 'LOW_STOCK' && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
                              n.type === 'NEW_SALE' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
                              n.type === 'DUE_REMINDER' && "bg-red-100 text-red-600 dark:bg-red-900/30",
                              n.type === 'STOCK_UPDATE' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            )}>
                              {n.type === 'LOW_STOCK' && <AlertCircle className="w-4 h-4" />}
                              {n.type === 'NEW_SALE' && <ShoppingCart className="w-4 h-4" />}
                              {n.type === 'DUE_REMINDER' && <DollarSign className="w-4 h-4" />}
                              {n.type === 'STOCK_UPDATE' && <Activity className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground">{n.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider">
                                {format(new Date(n.timestamp), 'MMM d, HH:mm')}
                              </p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Bell className="w-12 h-12 mb-2 opacity-20" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="p-2 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-[10px] font-bold uppercase tracking-widest hover:text-primary" 
                    onClick={() => dispatch(clearNotifications())}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-[10px] font-bold uppercase tracking-widest hover:text-primary" 
                    onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/logs' : '/seller/logs')}
                  >
                    All Activity
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 px-2 hover:bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Support</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
