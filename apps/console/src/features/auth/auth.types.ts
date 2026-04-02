export type ConsolePermission = 'console.home' | 'studio.playbooks';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canViewConsoleHome: boolean;
  canManagePlaybooks: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: ConsolePermission | string) => boolean;
}
