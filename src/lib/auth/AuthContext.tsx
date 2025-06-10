import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../api/api';

interface User {
  id: string;
  role: 'admin' | 'owner';
  name: string;
  flat_no?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'admin' | 'owner') => Promise<void>;
  register: (userData: OwnerRegisterData) => Promise<void>;
  logout: () => void;
}

interface OwnerRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  flat_no: string;
}

interface ApiResponse {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await API.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'admin' | 'owner') => {
    try {
      console.log('Making API call to:', `/auth/${role}/login`); // Debug log
      const response = await API.post<ApiResponse>(`/auth/${role}/login`, { email, password });
      console.log('Login response:', response.data); // Debug log
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Login API error:', error); // Debug log
      throw new Error('Login failed');
    }
  };

  const register = async (userData: OwnerRegisterData) => {
    try {
      const response = await API.post<ApiResponse>('/auth/owner/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 