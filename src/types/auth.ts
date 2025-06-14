
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'chef_agence' | 'admin_general' | 'sous_admin' | 'developer';
  agenceId?: string;
  agenceName?: string;
  isActive: boolean;
  balance?: number;
  commissions?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
