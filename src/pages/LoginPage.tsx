
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginLogo } from '@/components/LoginLogo';
import { LoginForm } from '@/components/LoginForm';
import { DemoCredentials } from '@/components/DemoCredentials';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async (username: string, password: string) => {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg border bg-card">
          <CardContent className="p-8">
            <LoginLogo />
            
            <div className="mt-6">
              <LoginForm onSubmit={handleSignIn} loading={loading} />
              <DemoCredentials />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
