
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, Info } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const LoginPage = () => {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(username, password);
      if (result.error) {
        console.error('Login failed:', result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <img 
                src="/lovable-uploads/5d2ea046-7e4b-4691-945f-759906349865.png" 
                alt="DHQ Logo" 
                className="w-24 h-24 mx-auto mb-6"
              />
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                DHQ Accommodation Platform
              </h1>
              <div className="text-2xl font-bold text-black">
                DAP
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-600 text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-yellow-100 border-gray-300 focus:border-gray-400 focus:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-yellow-100 border-gray-300 focus:border-gray-400 focus:ring-0 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base"
                disabled={loading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials - Below the form */}
            <Alert className="mt-6 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="font-medium mb-1">Demo Credentials:</div>
                <div className="text-sm">
                  Username: <span className="font-mono bg-blue-100 px-1 rounded">superadmin</span><br />
                  Password: <span className="font-mono bg-blue-100 px-1 rounded">admin123</span>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Default SuperAdmin account for local deployment
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
