
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const DemoCredentials = () => {
  return (
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
  );
};
