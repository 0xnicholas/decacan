import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, AuthState, LoginCredentials, User } from './auth.types';

// Development mode configuration
const DEV_MODE_SKIP_AUTH = true;

const MOCK_USER: User = {
  id: 'dev-user-001',
  email: 'dev@decacan.local',
  name: 'Developer',
  permissions: ['admin', 'read', 'write', 'delete'],
  role: 'admin',
};

const MOCK_TOKEN = 'dev-mode-mock-token';

// Extended interface for backward compatibility with existing routing
interface ExtendedAuthContextType extends AuthContextType {
  user: User | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Development mode: auto-login with mock user
    if (DEV_MODE_SKIP_AUTH) {
      localStorage.setItem('token', MOCK_TOKEN);
      setState({
        user: MOCK_USER,
        token: MOCK_TOKEN,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    // Check token validity on mount
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [validateToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const validateToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout]);

  const login = async (credentials: LoginCredentials) => {
    // Development mode: skip API call, auto-login
    if (DEV_MODE_SKIP_AUTH) {
      localStorage.setItem('token', MOCK_TOKEN);
      setState({
        user: MOCK_USER,
        token: MOCK_TOKEN,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const hasPermission = (permission: string) => {
    return state.user?.permissions.includes(permission) ?? false;
  };

  // Backward compatibility methods
  const setLoading = useCallback((loading: boolean) => {
    setState(s => ({ ...s, isLoading: loading }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState(s => ({ ...s, user, isAuthenticated: !!user }));
  }, []);

  const verify = useCallback(async () => {
    // Development mode: always authenticated
    if (DEV_MODE_SKIP_AUTH) {
      setState(s => ({ ...s, isLoading: false, isAuthenticated: true }));
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      await validateToken(token);
    } else {
      setState(s => ({ ...s, isLoading: false, isAuthenticated: false }));
    }
  }, [validateToken]);

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        user: state.user,
        loading: state.isLoading,
        setLoading,
        setUser,
        verify,
        login, 
        logout, 
        hasPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
