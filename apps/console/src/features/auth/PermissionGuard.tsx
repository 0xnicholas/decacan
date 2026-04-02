import { ReactNode } from 'react';
import { useAuth } from './auth-context';
import { Card } from '@/components/ui/card';
import { ShieldOff } from 'lucide-react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission(permission)) {
    return fallback || <AccessDenied />;
  }
  
  return children;
}

function AccessDenied() {
  return (
    <Card className="max-w-md mx-auto mt-20">
      <div className="text-center py-10">
        <ShieldOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    </Card>
  );
}
