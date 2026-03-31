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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
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

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    const tokens = localStorage.getItem(TOKEN_KEY);
    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => {
    const tokens = localStorage.getItem(TOKEN_KEY);
    if (!tokens) return null;
    
    const { accessToken } = JSON.parse(tokens);
    return accessToken;
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
