import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AgencyOperationType {
  id: string;
  agency_id: number;
  operation_type_id: string;
  is_enabled: boolean;
  daily_limit?: number;
  monthly_limit?: number;
  created_at: string;
  updated_at: string;
  operation_types?: {
    id: string;
    name: string;
    description: string;
    impacts_balance: boolean;
    is_active: boolean;
    status: string;
  };
  agencies?: {
    id: number;
    name: string;
  };
}

// Hook to get agency operation types
export function useAgencyOperationTypes(agencyId?: number) {
  return useSupabaseQuery(
    ['agency-operation-types', agencyId?.toString()],
    async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (*),
          agencies (id, name)
        `)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to get all agency operation types
export function useAllAgencyOperationTypes() {
  return useSupabaseQuery(
    ['all-agency-operation-types'],
    async () => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (*),
          agencies (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  );
}

// Hook to create agency operation type
export function useCreateAgencyOperationType() {
  return useSupabaseMutation<any, any>(
    async (data) => {
      const { data: result, error } = await supabase
        .from('agency_operation_types')
        .insert({
          agency_id: data.agency_id,
          operation_type_id: data.operation_type_id,
          is_enabled: data.is_enabled ?? true,
          daily_limit: data.daily_limit,
          monthly_limit: data.monthly_limit,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types']],
      successMessage: 'Type d\'opération assigné à l\'agence avec succès',
      errorMessage: 'Erreur lors de l\'assignation du type d\'opération',
    }
  );
}

// Hook to update agency operation type
export function useUpdateAgencyOperationType() {
  return useSupabaseMutation<any, { id: string; updates: any }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .update({
          is_enabled: updates.is_enabled,
          daily_limit: updates.daily_limit,
          monthly_limit: updates.monthly_limit,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types']],
      successMessage: 'Configuration mise à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour de la configuration',
    }
  );
}

// Hook to delete agency operation type
export function useDeleteAgencyOperationType() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { error } = await supabase
        .from('agency_operation_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types']],
      successMessage: 'Type d\'opération retiré de l\'agence avec succès',
      errorMessage: 'Erreur lors de la suppression',
    }
  );
}

// Hook for current user's agency operation types
export function useCurrentUserAgencyOperationTypes() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['current-user-agency-operation-types', user?.agenceId],
    async () => {
      if (!user?.agenceId) return [];
      
      const agencyId = typeof user.agenceId === 'string' ? parseInt(user.agenceId) : user.agenceId;
      
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (*)
        `)
        .eq('agency_id', agencyId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user?.agenceId,
    }
  );
}

// Hook to toggle operation type for agency
export function useToggleAgencyOperationType() {
  return useSupabaseMutation<any, { id: string; enabled: boolean }>(
    async ({ id, enabled }) => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .update({ is_enabled: enabled })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types'], ['current-user-agency-operation-types']],
      successMessage: 'Statut modifié avec succès',
      errorMessage: 'Erreur lors de la modification du statut',
    }
  );
}