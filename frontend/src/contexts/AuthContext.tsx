import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserType {
  id: string;
  username: string;
  role: string;
  storeName: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  gstNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login with:', { username, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response ok:', response.ok);
      console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Login error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('❌ Login error JSON:', errorJson);
        } catch (e) {
          console.log('❌ Login error is not JSON:', errorText);
        }
        
        return false;
      }
      
      const data = await response.json();
      console.log('✅ Login success data:', data);
      
      if (!data.token || !data.user) {
        console.log('❌ Login response missing token or user data');
        return false;
      }
      
      setToken(data.token);
      setUser({
        id: data.user._id || data.user.id,
        username: data.user.username,
        role: data.user.role,
        storeName: data.user.storeName,
        email: data.user.email
      });
      setIsAuthenticated(true);
      
      console.log('✅ Login successful, user authenticated');
      return true;
    } catch (err) {
      console.log('❌ Login network error:', err);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return false;
      const result = await res.json();
      setToken(result.token);
      setUser({
        id: result.user._id || result.user.id,
        username: result.user.username,
        role: result.user.role,
        storeName: result.user.storeName,
        email: result.user.email
      });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 