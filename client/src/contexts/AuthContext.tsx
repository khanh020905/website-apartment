import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { UserRole, SubscriptionTier, Profile } from '../../../shared/types';

// Extended User interface with profile data
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
  profile?: Profile;
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  subscription: SubscriptionTier;
  isAuthenticated: boolean;
  isLandlord: boolean;
  isBroker: boolean;
  isAdmin: boolean;
  canPost: boolean;
  canManageBuildings: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, phone?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive role and permissions from user
  const role: UserRole = user?.profile?.role || 'user';
  const subscription: SubscriptionTier = user?.profile?.subscription || 'free';
  const isAuthenticated = !!user;
  const isLandlord = role === 'landlord';
  const isBroker = role === 'broker';
  const isAdmin = role === 'admin';
  const canPost = isLandlord || isBroker || isAdmin;
  const canManageBuildings = isLandlord || isBroker || isAdmin;

  // Save session tokens to localStorage
  const saveSession = useCallback((session: Session | null) => {
    if (session) {
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  // Refresh profile data from server
  const refreshProfile = useCallback(async () => {
    const { data, error } = await api.get<{ user: User }>('/api/auth/me');
    if (!error && data) {
      setUser(data.user);
    }
  }, []);

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
  }, [saveSession]);

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

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'user',
    phone?: string
  ) => {
    const { data, error } = await api.post<{ user: User; session: Session }>(
      '/api/auth/register',
      { email, password, fullName, role, phone }
    );

    if (error || !data) {
      return { error: error || 'Đăng ký thất bại' };
    }

    // If Supabase returns a session (email confirmation disabled), auto-login
    if (data.session) {
      saveSession(data.session);
      setUser(data.user);
      await refreshProfile();
    }

    return { error: null };
  };

  const signOut = async () => {
    await api.post('/api/auth/logout', {});
    saveSession(null);
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    const { error } = await api.put<{ profile: Profile }>(
      '/api/auth/profile',
      profileData
    );

    if (error) {
      return { error };
    }

    // Refresh user data to get updated profile
    await refreshProfile();
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        subscription,
        isAuthenticated,
        isLandlord,
        isBroker,
        isAdmin,
        canPost,
        canManageBuildings,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
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
