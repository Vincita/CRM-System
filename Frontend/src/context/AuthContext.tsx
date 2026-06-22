import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, remember: boolean) => {
    setUser(userData);
    const serialized = JSON.stringify(userData);
    if (remember) {
      localStorage.setItem('user', serialized);
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', serialized);
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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