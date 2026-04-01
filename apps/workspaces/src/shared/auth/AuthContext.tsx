import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'decacan_tokens';
const USER_KEY = 'decacan_user';

// Safe localStorage helper with SSR guard
const isBrowser = typeof window !== 'undefined';

const safeGetItem = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
};

const safeRemoveItem = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

const safeParse = <T,>(key: string): T | null => {
  const data = safeGetItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    safeRemoveItem(key);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return safeParse<AuthUser>(USER_KEY);
  });

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
    
    const user: AuthUser = {
      id: data.user_id,
      email: data.email,
      name: data.name,
    };

    safeSetItem(TOKEN_KEY, JSON.stringify(tokens));
    safeSetItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    const tokens = safeGetItem(TOKEN_KEY);
    if (tokens) {
      try {
        const { accessToken } = JSON.parse(tokens);
        await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Ignore errors during logout
      }
    }
    
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => {
    const tokens = safeParse<AuthTokens>(TOKEN_KEY);
    return tokens?.accessToken ?? null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
