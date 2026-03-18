
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Package2, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state: RootState) => state.auth);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    // Mock authentication
    setTimeout(() => {
      if (email === 'admin@stockmaster.com' && password === 'Admin@123') {
        const user = { id: 'admin-1', name: 'Admin User', email, role: 'ADMIN' as const };
        dispatch(loginSuccess(user));
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else if (email === 'seller@stockmaster.com' && password === 'Seller@123') {
        const user = { id: 'seller-1', name: 'John Seller', email, role: 'SELLER' as const };
        dispatch(loginSuccess(user));
        toast.success('Welcome back, Seller!');
        navigate('/seller');
      } else {
        dispatch(loginFailure('Invalid email or password'));
        toast.error('Invalid credentials. Please try again.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-zinc-900 dark:bg-zinc-100 rounded-2xl">
              <Package2 className="w-8 h-8 text-white dark:text-zinc-900" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">StockMaster Pro</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@stockmaster.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="px-8 pb-8 text-center text-sm text-zinc-500">
          <p>Demo Credentials:</p>
          <p>Admin: admin@stockmaster.com / Admin@123</p>
          <p>Seller: seller@stockmaster.com / Seller@123</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
