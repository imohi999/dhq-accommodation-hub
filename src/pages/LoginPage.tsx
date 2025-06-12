
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Lock, User, Info } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  // Auto-create superadmin user on component mount if in development
  useEffect(() => {
    const createSuperadmin = async () => {
      try {
        await signUp('superadmin', 'admin123', 'Super Administrator');
      } catch (error) {
        // User might already exist, which is fine
        console.log('Superadmin user creation attempt:', error);
      }
    };
    
    if (process.env.NODE_ENV === 'development') {
      createSuperadmin();
    }
  }, [signUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(username, password);
      } else {
        await signUp(username, password, fullName);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-800 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-400">
              <Shield className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">DHQ</h1>
          <h2 className="text-2xl font-semibold text-emerald-700 mb-1">Accommodation Platform</h2>
          <div className="inline-block bg-emerald-800 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold">
            DAP
          </div>
        </div>

        {/* Demo Credentials Info Box */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Demo Credentials:</strong><br />
            Username: <code className="bg-blue-100 px-1 rounded">superadmin</code><br />
            Password: <code className="bg-blue-100 px-1 rounded">admin123</code>
          </AlertDescription>
        </Alert>

        {/* Login Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6 bg-yellow-50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-emerald-800">
              {isLogin ? 'Login to DAP' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center text-emerald-600">
              {isLogin 
                ? 'Enter your credentials to access the accommodation platform' 
                : 'Create a new account to get started'
              }
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-emerald-800 font-semibold">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-yellow-50"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-emerald-800 font-semibold">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-yellow-50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-emerald-800 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-yellow-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-emerald-600 hover:text-emerald-800"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-emerald-700">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-yellow-100 font-semibold text-lg shadow-lg"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-emerald-700">
          <p className="text-sm font-medium">
            © 2024 Defence Headquarters Accommodation Platform
          </p>
          <p className="text-xs mt-1 text-emerald-600">
            Authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
