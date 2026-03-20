import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Save session tokens to localStorage
  const saveSession = (session: Session | null) => {
    if (session) {
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data, error } = await api.get<{ user: User }>('/api/auth/me');
      if (error || !data) {
        // Token expired — try refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResult = await api.post<{ user: User; session: Session }>(
            '/api/auth/refresh',
            { refresh_token: refreshToken }
          );
          if (refreshResult.data) {
            saveSession(refreshResult.data.session);
            setUser(refreshResult.data.user);
          } else {
            saveSession(null);
          }
        } else {
          saveSession(null);
        }
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await api.post<{ user: User; session: Session }>(
      '/api/auth/login',
      { email, password }
    );

    if (error || !data) {
      return { error: error || 'Đăng nhập thất bại' };
    }

    saveSession(data.session);
    setUser(data.user);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await api.post<{ user: User; session: Session }>(
      '/api/auth/register',
      { email, password, fullName }
    );

    if (error || !data) {
      return { error: error || 'Đăng ký thất bại' };
    }

    // If Supabase returns a session (email confirmation disabled), auto-login
    if (data.session) {
      saveSession(data.session);
      setUser(data.user);
    }

    return { error: null };
  };

  const signOut = async () => {
    await api.post('/api/auth/logout', {});
    saveSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
