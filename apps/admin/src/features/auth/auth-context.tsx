import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState, LoginCredentials, User } from './auth.types';

// Development mode configuration
const DEV_MODE_SKIP_AUTH = true;

type SurfacePermissions = {
  console_home: boolean;
  studio_playbooks: boolean;
};

const MOCK_USER: User = {
  id: 'dev-user-001',
  email: 'dev@decacan.local',
  name: 'Developer',
  permissions: ['admin', 'read', 'write', 'delete'],
  role: 'admin',
};

const MOCK_TOKEN = 'dev-mode-mock-token';
const PERMISSIONS_ENDPOINT = '/api/me/permissions';
const AUTH_ME_ENDPOINT = '/api/auth/me';
const AUTH_LOGIN_ENDPOINT = '/api/auth/login';

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
    canViewConsoleHome: false,
    canManagePlaybooks: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      canViewConsoleHome: false,
      canManagePlaybooks: false,
    });
  }, []);

  const resolvePermissions = useCallback(
    async (token: string | null, fallback: SurfacePermissions) => {
      if (!token) {
        setState(s => ({
          ...s,
          canViewConsoleHome: fallback.console_home,
          canManagePlaybooks: fallback.studio_playbooks,
          isLoading: false,
        }));
        return fallback;
      }

      try {
        const response = await fetch(PERMISSIONS_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const permissions = (await response.json()) as Partial<SurfacePermissions>;
          const nextPermissions: SurfacePermissions = {
            console_home: permissions.console_home ?? fallback.console_home,
            studio_playbooks: permissions.studio_playbooks ?? fallback.studio_playbooks,
          };

          setState(s => ({
            ...s,
            canViewConsoleHome: nextPermissions.console_home,
            canManagePlaybooks: nextPermissions.studio_playbooks,
            isLoading: false,
          }));

          return nextPermissions;
        }
      } catch {
        // Fall through to the fallback permission shape.
      }

      setState(s => ({
        ...s,
        canViewConsoleHome: fallback.console_home,
        canManagePlaybooks: fallback.studio_playbooks,
        isLoading: false,
      }));

      return fallback;
    },
    [],
  );

  const syncAuthenticatedUser = useCallback(
    async (user: User, token: string, fallbackPermissions: SurfacePermissions) => {
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: true,
        canViewConsoleHome: false,
        canManagePlaybooks: false,
      });

      await resolvePermissions(token, fallbackPermissions);
    },
    [resolvePermissions],
  );

  const validateToken = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(AUTH_ME_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          logout();
          return;
        }

        const user = (await response.json()) as User;
        await syncAuthenticatedUser(user, token, {
          console_home: true,
          studio_playbooks: false,
        });
      } catch {
        logout();
      }
    },
    [logout, syncAuthenticatedUser],
  );

  useEffect(() => {
    if (!DEV_MODE_SKIP_AUTH && !localStorage.getItem('token')) {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const verify = useCallback(async () => {
    if (DEV_MODE_SKIP_AUTH) {
      const token = localStorage.getItem('token') ?? MOCK_TOKEN;
      localStorage.setItem('token', token);
      await syncAuthenticatedUser(MOCK_USER, token, {
        console_home: true,
        studio_playbooks: true,
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      await validateToken(token);
      return;
    }

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      canViewConsoleHome: false,
      canManagePlaybooks: false,
    });
  }, [syncAuthenticatedUser, validateToken]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (DEV_MODE_SKIP_AUTH) {
        const token = MOCK_TOKEN;
        localStorage.setItem('token', token);
        await syncAuthenticatedUser(MOCK_USER, token, {
          console_home: true,
          studio_playbooks: true,
        });
        return;
      }

      const response = await fetch(AUTH_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token, user } = (await response.json()) as { token: string; user: User };
      localStorage.setItem('token', token);
      await syncAuthenticatedUser(user, token, {
        console_home: true,
        studio_playbooks: false,
      });
    },
    [syncAuthenticatedUser],
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (permission === 'console.home') {
        return state.canViewConsoleHome;
      }

      if (permission === 'studio.playbooks') {
        return state.canManagePlaybooks;
      }

      return state.user?.permissions.includes(permission) ?? false;
    },
    [state.canManagePlaybooks, state.canViewConsoleHome, state.user],
  );

  // Backward compatibility methods
  const setLoading = useCallback((loading: boolean) => {
    setState(s => ({ ...s, isLoading: loading }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState(s => ({ ...s, user, isAuthenticated: !!user }));
  }, []);

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
        hasPermission,
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
