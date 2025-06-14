
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simuler la récupération de l'utilisateur depuis le localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation de l'authentification - remplacer par l'API réelle
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'agent@demo.com',
        name: 'Agent Demo',
        role: 'agent',
        agenceId: 'agence1',
        agenceName: 'Agence Centre-Ville',
        isActive: true,
        balance: 150000,
        commissions: 25000,
      },
      {
        id: '2',
        email: 'chef@demo.com',
        name: 'Chef Agence Demo',
        role: 'chef_agence',
        agenceId: 'agence1',
        agenceName: 'Agence Centre-Ville',
        isActive: true,
        balance: 500000,
        commissions: 75000,
      },
      {
        id: '3',
        email: 'admin@demo.com',
        name: 'Admin Général',
        role: 'admin_general',
        isActive: true,
      }
    ];

    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'demo123') {
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
