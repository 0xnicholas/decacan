import { ReactNode } from 'react';
import { StoreClientProvider } from '@/pages/store-client/components/context';
import { StoreClientWrapper } from '@/pages/store-client/components/wrapper';

export function ModulesProvider({ children }: { children: ReactNode }) {
  return (
    <StoreClientProvider>
      <StoreClientWrapper>{children}</StoreClientWrapper>
    </StoreClientProvider>
  );
}
