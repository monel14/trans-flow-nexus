import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  balance: number;
  is_active: boolean;
  role_id?: number;
  agency_id?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  roles?: {
    id: number;
    name: string;
    label: string;
  };
  agencies?: {
    id: number;
    name: string;
    city?: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// Hook to get current user's profile
export function useProfile() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['profile', user?.id],
    async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (id, name, label),
          agencies (id, name, city)
        `)
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to get user profile by ID (for admins)
export function useUserProfile(userId: string) {
  return useSupabaseQuery(
    ['user-profile', userId],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (id, name, label),
          agencies (id, name, city)
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    {
      enabled: !!userId,
    }
  );
}

// Hook to get users by role
export function useUsersByRole(roleName?: string) {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['users-by-role', roleName, user?.agenceId],
    async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          roles (id, name, label),
          agencies (id, name, city)
        `)
        .eq('is_active', true);
      
      // Filter by role if provided
      if (roleName) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();
        
        if (roleData) {
          query = query.eq('role_id', roleData.id);
        }
      }
      
      // If current user is chef_agence, only show users from their agency
      if (user?.role === 'chef_agence' && user?.agenceId) {
        query = query.eq('agency_id', parseInt(user.agenceId));
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Profile[];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to update current user's profile
export function useUpdateProfile() {
  const { user } = useAuth();
  
  return useSupabaseMutation<Profile, UpdateProfileData>(
    async (updates) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    {
      invalidateQueries: [['profile']],
      successMessage: 'Profil mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour du profil',
    }
  );
}

// Hook to get balance history
export function useBalanceHistory() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['balance-history', user?.id],
    async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transaction_ledger')
        .select(`
          *,
          operations (reference_number, operation_types (name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook for admin to manage user (activate/deactivate, change role, etc.)
export function useManageUser() {
  return useSupabaseMutation<any, {
    user_id: string;
    is_active?: boolean;
    role_id?: number;
    agency_id?: number;
    balance_adjustment?: number;
    adjustment_reason?: string;
  }>(
    async (userData) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management?resource=users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la gestion utilisateur');
      }
      
      return result;
    },
    {
      invalidateQueries: [['users-by-role'], ['user-profile']],
      successMessage: 'Utilisateur mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour utilisateur',
    }
  );
}

// Hook to create new user (admin only)
export function useCreateUser() {
  return useSupabaseMutation<any, {
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    password: string;
    role_name: string;
    agency_id?: number;
    initial_balance?: number;
  }>(
    async (userData) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-management?resource=users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création utilisateur');
      }
      
      return result;
    },
    {
      invalidateQueries: [['users-by-role']],
      successMessage: 'Utilisateur créé avec succès',
      errorMessage: 'Erreur lors de la création utilisateur',
    }
  );
}