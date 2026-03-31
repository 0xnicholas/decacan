import type { PropsWithChildren } from "react";
import { AuthProvider } from "../shared/auth/AuthContext";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
