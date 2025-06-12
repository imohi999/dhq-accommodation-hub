
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const DemoCredentials = () => {
  return (
    <Alert className="mt-6 border-primary/20 bg-primary/10">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-primary">
        <div className="font-medium mb-1">Super Admin Credentials:</div>
        <div className="text-sm">
          Username: <span className="font-mono bg-primary/20 px-1 rounded">superadmin</span><br />
          Password: <span className="font-mono bg-primary/20 px-1 rounded">admin123</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Default SuperAdmin account for local deployment
        </div>
      </AlertDescription>
    </Alert>
  );
};
