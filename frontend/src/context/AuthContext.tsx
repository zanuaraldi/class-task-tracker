import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, LoginInput, RegisterInput } from '@class-task-tracker/shared';
import { api, ApiError } from '../services/api';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'teacher' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const savedToken = storage.getToken();
      if (!savedToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        if (mounted) {
          setUser(response.user);
          storage.setUser(response.user);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          storage.clearAuth();
          if (mounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginInput) => {
    const data = await api.auth.login(credentials);
    storage.setToken(data.token);
    storage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: RegisterInput) => {
    const data = await api.auth.register(payload);
    storage.setToken(data.token);
    storage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  };

  const quickLogin = async (role: 'teacher' | 'student') => {
    const credentials =
      role === 'teacher'
        ? { email: 'teacher@example.com', password: 'password123' }
        : { email: 'student1@example.com', password: 'password123' };

    await login(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
