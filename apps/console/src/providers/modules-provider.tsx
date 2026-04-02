import { ReactNode } from 'react';

export function ModulesProvider({ children }: { children: ReactNode }) {
  // Simplified - removed store-client dependencies
  // Add module-specific providers here when needed
  return <>{children}</>;
}