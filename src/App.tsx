import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProductManagement from './pages/ProductManagement';
import SellerManagement from './pages/SellerManagement';
import CategoryManagement from './pages/CategoryManagement';
import ActivityLogs from './pages/ActivityLogs';
import SellerProductManagement from './pages/SellerProductManagement';
import POS from './pages/POS';
import CustomerManagement from './pages/CustomerManagement';
import SupplierManagement from './pages/SupplierManagement';
import SalesHistory from './pages/SalesHistory';
import StockMovement from './pages/StockMovement';
import Reports from './pages/Reports';

export default function App() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/seller'} replace /> : <LoginPage />} 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/pos" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <POS />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <ProductManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <CategoryManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/customers" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <CustomerManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/suppliers" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <SupplierManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sellers" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <SellerManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sales-history" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <SalesHistory />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/stock-movement" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <StockMovement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <ActivityLogs />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Seller Routes */}
        <Route 
          path="/seller" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <SellerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/pos" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <POS />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/products" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <ProductManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/customers" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <CustomerManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/sales-history" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <SalesHistory />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/logs" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <DashboardLayout>
                <ActivityLogs />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Default Redirect */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : '/seller') : '/login'} replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
