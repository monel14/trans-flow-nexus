import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Agency {
  id: number;
  name: string;
  city?: string;
  chef_agence_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  chef_agence?: {
    id: string;
    name: string;
    email: string;
    balance?: number;
  };
  agency_operation_types?: any[];
}

// Hook to get all agencies
export function useAgencies() {
  return useSupabaseQuery(
    ['agencies'],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  );
}

// Hook to get agencies with their operation types
export function useAgenciesWithOperationTypes() {
  return useSupabaseQuery(
    ['agencies-with-operation-types'],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          agency_operation_types (
            id,
            operation_type_id,
            is_enabled,
            operation_types (id, name, description)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  );
}

// Hook to get a single agency
export function useAgency(agencyId: number) {
  return useSupabaseQuery(
    ['agency', agencyId.toString()],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to get agency with operation types
export function useAgencyWithOperationTypes(agencyId: number) {
  return useSupabaseQuery(
    ['agency-with-operation-types', agencyId.toString()],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          agency_operation_types (
            id,
            operation_type_id,
            is_enabled,
            daily_limit,
            monthly_limit,
            operation_types (id, name, description)
          )
        `)
        .eq('id', agencyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to create agency (admins only)
export function useCreateAgency() {
  return useSupabaseMutation<Agency, Omit<Agency, 'id' | 'created_at' | 'updated_at'>>(
    async (agencyData) => {
      const { data, error } = await supabase
        .from('agencies')
        .insert(agencyData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['agencies'], ['agencies-with-operation-types']],
      successMessage: 'Agence créée avec succès',
      errorMessage: 'Erreur lors de la création de l\'agence',
    }
  );
}

  // Hook to update agency (admins only)
  export function useUpdateAgency() {
    return useSupabaseMutation<Agency, { id: number; [key: string]: any }>(
      async (data) => {
        const { id, ...updates } = data;
        const { data: result, error } = await supabase
          .from('agencies')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      },
      {
        invalidateQueries: [['agencies'], ['agencies-with-operation-types'], ['agency']],
        successMessage: 'Agence mise à jour avec succès',
        errorMessage: 'Erreur lors de la mise à jour de l\'agence',
      }
    );
  }

// Hook to delete agency (admins only)
export function useDeleteAgency() {
  return useSupabaseMutation<void, number>(
    async (agencyId) => {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', agencyId);
      
      if (error) throw error;
    },
    {
      invalidateQueries: [['agencies'], ['agencies-with-operation-types']],
      successMessage: 'Agence supprimée avec succès',
      errorMessage: 'Erreur lors de la suppression de l\'agence',
    }
  );
}

// Hook to assign chef to agency
export function useAssignChefToAgency() {
  return useSupabaseMutation<Agency, { agencyId: number; chefId: string }>(
    async ({ agencyId, chefId }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update({ chef_agence_id: chefId })
        .eq('id', agencyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['agencies'], ['agencies-with-operation-types'], ['agency']],
      successMessage: 'Chef d\'agence assigné avec succès',
      errorMessage: 'Erreur lors de l\'assignation du chef d\'agence',
    }
  );
}

// Hook to get agencies for current user (chef access)
export function useUserAgencies() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['user-agencies', user?.id],
    async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('chef_agence_id', user.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to search agencies
export function useSearchAgencies(searchTerm: string) {
  return useSupabaseQuery(
    ['search-agencies', searchTerm],
    async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name')
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: searchTerm.length > 2,
    }
  );
}