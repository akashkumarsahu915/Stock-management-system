
export type UserRole = 'ADMIN' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface ProductFeature {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  supplier: string;
  lastUpdated: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  assignedTo?: string;
  features?: ProductFeature[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
  pendingDue: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  totalPaid: number;
  pendingBalance: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceId: string;
  date: string;
  sellerId: string;
  sellerName: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  actionType: 'ADDED' | 'INCREASED' | 'DECREASED' | 'SALES_DEDUCTION';
  quantityChanged: number;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'STOCK_UPDATE' | 'PRODUCT_MANAGEMENT' | 'USER_MANAGEMENT' | 'SYSTEM' | 'SALE' | 'CUSTOMER' | 'SUPPLIER';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'NEW_SALE' | 'DUE_REMINDER' | 'STOCK_UPDATE';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface StockState {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  stockLogs: StockLog[];
  logs: ActivityLog[];
  sellers: User[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}
