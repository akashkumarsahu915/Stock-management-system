
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockState, Product, Category, ActivityLog, User, Customer, Supplier, Sale, StockLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock initial data
const initialProducts: Product[] = [
  { id: '1', name: 'MacBook Pro 14"', category: 'Electronics', price: 1999, quantity: 15, supplier: 'Apple Inc.', lastUpdated: new Date().toISOString(), status: 'IN_STOCK' },
  { id: '2', name: 'iPhone 15 Pro', category: 'Electronics', price: 999, quantity: 5, supplier: 'Apple Inc.', lastUpdated: new Date().toISOString(), status: 'LOW_STOCK' },
  { id: '3', name: 'Dell XPS 15', category: 'Electronics', price: 1499, quantity: 0, supplier: 'Dell Technologies', lastUpdated: new Date().toISOString(), status: 'OUT_OF_STOCK' },
  { id: '4', name: 'Sony WH-1000XM5', category: 'Audio', price: 349, quantity: 25, supplier: 'Sony Electronics', lastUpdated: new Date().toISOString(), status: 'IN_STOCK' },
  { id: '5', name: 'Logitech MX Master 3S', category: 'Peripherals', price: 99, quantity: 12, supplier: 'Logitech', lastUpdated: new Date().toISOString(), status: 'IN_STOCK' },
];

const initialCategories: Category[] = [
  { id: '1', name: 'Electronics', description: 'Computing and mobile devices' },
  { id: '2', name: 'Audio', description: 'Headphones and speakers' },
  { id: '3', name: 'Peripherals', description: 'Mice, keyboards, and monitors' },
];

const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', address: '123 Maple St', totalPurchases: 2500, pendingDue: 0, createdAt: new Date().toISOString() },
  { id: 'cust-2', name: 'Bob Smith', phone: '555-0102', email: 'bob@example.com', address: '456 Oak Ave', totalPurchases: 1200, pendingDue: 150, createdAt: new Date().toISOString() },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Apple Inc.', company: 'Apple', phone: '1-800-MY-APPLE', email: 'sales@apple.com', address: 'Cupertino, CA', createdAt: new Date().toISOString(), totalPaid: 50000, pendingBalance: 10000 },
  { id: 'sup-2', name: 'Sony Electronics', company: 'Sony', phone: '1-800-SONY', email: 'support@sony.com', address: 'Tokyo, Japan', createdAt: new Date().toISOString(), totalPaid: 25000, pendingBalance: 0 },
];

const initialSellers: User[] = [
  { id: 'seller-1', name: 'John Seller', email: 'seller@stockmaster.com', role: 'SELLER' },
];

const initialState: StockState = {
  products: JSON.parse(localStorage.getItem('products') || JSON.stringify(initialProducts)),
  categories: JSON.parse(localStorage.getItem('categories') || JSON.stringify(initialCategories)),
  customers: JSON.parse(localStorage.getItem('customers') || JSON.stringify(initialCustomers)),
  suppliers: JSON.parse(localStorage.getItem('suppliers') || JSON.stringify(initialSuppliers)),
  sales: JSON.parse(localStorage.getItem('sales') || '[]'),
  stockLogs: JSON.parse(localStorage.getItem('stockLogs') || '[]'),
  logs: JSON.parse(localStorage.getItem('logs') || '[]'),
  sellers: JSON.parse(localStorage.getItem('sellers') || JSON.stringify(initialSellers)),
  notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
  loading: false,
  error: null,
};

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    // Product Actions
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'lastUpdated' | 'status'>>) => {
      const id = uuidv4();
      const newProduct: Product = {
        ...action.payload,
        id,
        lastUpdated: new Date().toISOString(),
        status: action.payload.quantity === 0 ? 'OUT_OF_STOCK' : action.payload.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK',
      };
      state.products.push(newProduct);
      
      // Add stock log
      state.stockLogs.unshift({
        id: uuidv4(),
        productId: id,
        productName: newProduct.name,
        actionType: 'ADDED',
        quantityChanged: newProduct.quantity,
        userId: 'system',
        userName: 'System',
        timestamp: new Date().toISOString(),
      });

      // Notification for low stock if added with low quantity
      if (newProduct.quantity < 10 && newProduct.quantity > 0) {
        state.notifications.unshift({
          id: uuidv4(),
          title: 'Low Stock Alert',
          message: `${newProduct.name} has low stock (${newProduct.quantity} left).`,
          type: 'LOW_STOCK',
          timestamp: new Date().toISOString(),
          read: false,
          actionLink: '/admin/products'
        });
      }

      localStorage.setItem('products', JSON.stringify(state.products));
      localStorage.setItem('stockLogs', JSON.stringify(state.stockLogs));
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        const oldProduct = state.products[index];
        const diff = action.payload.quantity - oldProduct.quantity;
        
        state.products[index] = {
          ...action.payload,
          lastUpdated: new Date().toISOString(),
          status: action.payload.quantity === 0 ? 'OUT_OF_STOCK' : action.payload.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK',
        };

        if (diff !== 0) {
          state.stockLogs.unshift({
            id: uuidv4(),
            productId: action.payload.id,
            productName: action.payload.name,
            actionType: diff > 0 ? 'INCREASED' : 'DECREASED',
            quantityChanged: Math.abs(diff),
            userId: 'system',
            userName: 'System',
            timestamp: new Date().toISOString(),
          });

          // Notification for stock update
          state.notifications.unshift({
            id: uuidv4(),
            title: 'Stock Updated',
            message: `${action.payload.name} stock ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}.`,
            type: 'STOCK_UPDATE',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: '/admin/stock-movement'
          });
        }

        // Notification for low stock
        if (action.payload.quantity < 10 && action.payload.quantity > 0 && (oldProduct.quantity >= 10 || oldProduct.quantity === 0)) {
          state.notifications.unshift({
            id: uuidv4(),
            title: 'Low Stock Alert',
            message: `${action.payload.name} is running low (${action.payload.quantity} left).`,
            type: 'LOW_STOCK',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: '/admin/products'
          });
        }

        localStorage.setItem('products', JSON.stringify(state.products));
        localStorage.setItem('stockLogs', JSON.stringify(state.stockLogs));
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      localStorage.setItem('products', JSON.stringify(state.products));
    },
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number; userId: string; userName: string }>) => {
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        const oldQty = product.quantity;
        const diff = action.payload.quantity - oldQty;
        product.quantity = action.payload.quantity;
        product.lastUpdated = new Date().toISOString();
        product.status = product.quantity === 0 ? 'OUT_OF_STOCK' : product.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK';
        
        // Stock Log
        state.stockLogs.unshift({
          id: uuidv4(),
          productId: product.id,
          productName: product.name,
          actionType: diff > 0 ? 'INCREASED' : 'DECREASED',
          quantityChanged: Math.abs(diff),
          userId: action.payload.userId,
          userName: action.payload.userName,
          timestamp: new Date().toISOString(),
        });

        // Activity Log
        const log: ActivityLog = {
          id: uuidv4(),
          userId: action.payload.userId,
          userName: action.payload.userName,
          action: 'STOCK_UPDATE',
          details: `Updated stock for ${product.name} from ${oldQty} to ${product.quantity}`,
          timestamp: new Date().toISOString(),
          type: 'STOCK_UPDATE',
        };
        state.logs.unshift(log);
        
        localStorage.setItem('products', JSON.stringify(state.products));
        localStorage.setItem('stockLogs', JSON.stringify(state.stockLogs));
        localStorage.setItem('logs', JSON.stringify(state.logs));
      }
    },
    // Customer Actions
    addCustomer: (state, action: PayloadAction<Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'pendingDue'>>) => {
      const newCustomer: Customer = {
        ...action.payload,
        id: uuidv4(),
        totalPurchases: 0,
        pendingDue: 0,
        createdAt: new Date().toISOString(),
      };
      state.customers.push(newCustomer);
      localStorage.setItem('customers', JSON.stringify(state.customers));
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
        localStorage.setItem('customers', JSON.stringify(state.customers));
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
      localStorage.setItem('customers', JSON.stringify(state.customers));
    },
    // Supplier Actions
    addSupplier: (state, action: PayloadAction<Omit<Supplier, 'id' | 'createdAt' | 'totalPaid' | 'pendingBalance'>>) => {
      const newSupplier: Supplier = {
        ...action.payload,
        id: uuidv4(),
        totalPaid: 0,
        pendingBalance: 0,
        createdAt: new Date().toISOString(),
      };
      state.suppliers.push(newSupplier);
      localStorage.setItem('suppliers', JSON.stringify(state.suppliers));
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.suppliers[index] = action.payload;
        localStorage.setItem('suppliers', JSON.stringify(state.suppliers));
      }
    },
    updateSupplierPayment: (state, action: PayloadAction<{ supplierId: string; amountPaid: number; userId: string; userName: string }>) => {
      const supplier = state.suppliers.find(s => s.id === action.payload.supplierId);
      if (supplier) {
        supplier.totalPaid += action.payload.amountPaid;
        supplier.pendingBalance -= action.payload.amountPaid;
        
        state.logs.unshift({
          id: uuidv4(),
          userId: action.payload.userId,
          userName: action.payload.userName,
          action: 'SUPPLIER',
          details: `Paid $${action.payload.amountPaid} to ${supplier.name}. Remaining balance: $${supplier.pendingBalance}`,
          timestamp: new Date().toISOString(),
          type: 'SUPPLIER',
        });

        localStorage.setItem('suppliers', JSON.stringify(state.suppliers));
        localStorage.setItem('logs', JSON.stringify(state.logs));
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
      localStorage.setItem('suppliers', JSON.stringify(state.suppliers));
    },
    // Sales Actions
    addSale: (state, action: PayloadAction<Omit<Sale, 'id' | 'invoiceId' | 'date'>>) => {
      const saleId = uuidv4();
      const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
      const newSale: Sale = {
        ...action.payload,
        id: saleId,
        invoiceId,
        date: new Date().toISOString(),
      };
      state.sales.unshift(newSale);

      // Update product quantities
      action.payload.items.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
          const oldQty = product.quantity;
          product.quantity -= item.quantity;
          product.lastUpdated = new Date().toISOString();
          product.status = product.quantity === 0 ? 'OUT_OF_STOCK' : product.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK';
          
          // Stock Log
          state.stockLogs.unshift({
            id: uuidv4(),
            productId: product.id,
            productName: product.name,
            actionType: 'SALES_DEDUCTION',
            quantityChanged: item.quantity,
            userId: action.payload.sellerId,
            userName: action.payload.sellerName,
            timestamp: new Date().toISOString(),
          });

          // Notification for low stock after sale
          if (product.quantity < 10 && product.quantity > 0 && oldQty >= 10) {
            state.notifications.unshift({
              id: uuidv4(),
              title: 'Low Stock Alert',
              message: `${product.name} is running low after sale (${product.quantity} left).`,
              type: 'LOW_STOCK',
              timestamp: new Date().toISOString(),
              read: false,
              actionLink: '/admin/products'
            });
          }
        }
      });

      // Update customer stats
      const customer = state.customers.find(c => c.id === action.payload.customerId);
      if (customer) {
        customer.totalPurchases += action.payload.totalAmount;
        customer.pendingDue += action.payload.dueAmount;

        // Notification for due reminder
        if (action.payload.dueAmount > 0) {
          state.notifications.unshift({
            id: uuidv4(),
            title: 'Customer Due Reminder',
            message: `${customer.name} has a pending due of $${action.payload.dueAmount} from sale ${invoiceId}.`,
            type: 'DUE_REMINDER',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: '/admin/customers'
          });
        }
      }

      // Notification for new sale
      state.notifications.unshift({
        id: uuidv4(),
        title: 'New Sale Completed',
        message: `Sale ${invoiceId} for $${action.payload.totalAmount} completed by ${action.payload.sellerName}.`,
        type: 'NEW_SALE',
        timestamp: new Date().toISOString(),
        read: false,
        actionLink: '/admin/sales-history'
      });

      // Activity Log
      state.logs.unshift({
        id: uuidv4(),
        userId: action.payload.sellerId,
        userName: action.payload.sellerName,
        action: 'SALE',
        details: `Completed sale ${invoiceId} for ${action.payload.customerName}. Total: $${action.payload.totalAmount}`,
        timestamp: new Date().toISOString(),
        type: 'SALE',
      });

      localStorage.setItem('sales', JSON.stringify(state.sales));
      localStorage.setItem('products', JSON.stringify(state.products));
      localStorage.setItem('customers', JSON.stringify(state.customers));
      localStorage.setItem('stockLogs', JSON.stringify(state.stockLogs));
      localStorage.setItem('logs', JSON.stringify(state.logs));
    },
    updateDuePayment: (state, action: PayloadAction<{ customerId: string; amountPaid: number; userId: string; userName: string }>) => {
      const customer = state.customers.find(c => c.id === action.payload.customerId);
      if (customer) {
        customer.pendingDue -= action.payload.amountPaid;
        
        // Notification for payment received
        state.notifications.unshift({
          id: uuidv4(),
          title: 'Payment Received',
          message: `Received $${action.payload.amountPaid} from ${customer.name}. Remaining due: $${customer.pendingDue.toFixed(2)}`,
          type: 'NEW_SALE', // Using NEW_SALE type for financial updates
          timestamp: new Date().toISOString(),
          read: false,
          actionLink: '/admin/customers'
        });

        state.logs.unshift({
          id: uuidv4(),
          userId: action.payload.userId,
          userName: action.payload.userName,
          action: 'CUSTOMER',
          details: `Received payment of $${action.payload.amountPaid} from ${customer.name}. Remaining due: $${customer.pendingDue}`,
          timestamp: new Date().toISOString(),
          type: 'CUSTOMER',
        });

        localStorage.setItem('customers', JSON.stringify(state.customers));
        localStorage.setItem('logs', JSON.stringify(state.logs));
      }
    },
    // Category Actions
    addCategory: (state, action: PayloadAction<Omit<Category, 'id'>>) => {
      const newCategory: Category = {
        ...action.payload,
        id: uuidv4(),
      };
      state.categories.push(newCategory);
      localStorage.setItem('categories', JSON.stringify(state.categories));
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
      localStorage.setItem('categories', JSON.stringify(state.categories));
    },
    // Seller Actions
    addSeller: (state, action: PayloadAction<Omit<User, 'id' | 'role'>>) => {
      const newSeller: User = {
        ...action.payload,
        id: uuidv4(),
        role: 'SELLER',
      };
      state.sellers.push(newSeller);
      localStorage.setItem('sellers', JSON.stringify(state.sellers));
    },
    removeSeller: (state, action: PayloadAction<string>) => {
      state.sellers = state.sellers.filter(s => s.id !== action.payload);
      localStorage.setItem('sellers', JSON.stringify(state.sellers));
    },
    // Log Action
    addLog: (state, action: PayloadAction<Omit<ActivityLog, 'id' | 'timestamp'>>) => {
      const log: ActivityLog = {
        ...action.payload,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };
      state.logs.unshift(log);
      localStorage.setItem('logs', JSON.stringify(state.logs));
    },
    // Notification Actions
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    clearNotifications: (state) => {
      state.notifications = [];
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    }
  },
});

export const { 
  addProduct, updateProduct, deleteProduct, updateStock, 
  addCategory, deleteCategory, 
  addSeller, removeSeller,
  addLog,
  addCustomer, updateCustomer, deleteCustomer,
  addSupplier, updateSupplier, deleteSupplier, updateSupplierPayment,
  addSale, updateDuePayment,
  markNotificationRead, markAllNotificationsRead, clearNotifications
} = stockSlice.actions;
export default stockSlice.reducer;
