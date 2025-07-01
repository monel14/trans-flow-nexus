import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';

export interface Agency {
  id: number;
  name: string;
  city: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  chef_agence?: {
    id: string;
    name: string;
    email: string;
    balance?: number;
  };
  agency_operation_types?: Array<{
    id: string;
    operation_type_id: string;
    is_active: boolean;
    operation_types?: {
      id: string;
      name: string;
      description: string;
    };
  }>;
}

export interface CreateAgencyData {
  name: string;
  city: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
}

export interface UpdateAgencyData extends CreateAgencyData {
  id: number;
  is_active?: boolean;
}

// Hook to get all agencies
export function useAgencies() {
  return useSupabaseQuery(
    ['agencies'],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email, balance),
          agency_operation_types (
            id,
            operation_type_id,
            is_active,
            operation_types (id, name, description)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Agency[];
    }
  );
}

// Hook to get a single agency
export function useAgency(agencyId: number) {
  return useSupabaseQuery(
    ['agency', agencyId],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email, balance),
          agency_operation_types (
            id,
            operation_type_id,
            is_active,
            operation_types (id, name, description, affects_balance)
          )
        `)
        .eq('id', agencyId)
        .single();
      
      if (error) throw error;
      return data as Agency;
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to get active agencies only
export function useActiveAgencies() {
  return useSupabaseQuery(
    ['active-agencies'],
    async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Agency[];
    }
  );
}

// Hook to create a new agency
export function useCreateAgency() {
  return useSupabaseMutation<Agency, CreateAgencyData>(
    async (agencyData) => {
      const { data, error } = await supabase
        .from('agencies')
        .insert({
          ...agencyData,
          is_active: true,
        })
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data as Agency;
    },
    {
      invalidateQueries: [['agencies'], ['active-agencies']],
      successMessage: 'Agence créée avec succès',
      errorMessage: 'Erreur lors de la création de l\'agence',
    }
  );
}

// Hook to update an agency
export function useUpdateAgency() {
  return useSupabaseMutation<Agency, UpdateAgencyData>(
    async ({ id, ...agencyData }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update({
          ...agencyData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data as Agency;
    },
    {
      invalidateQueries: [['agencies'], ['active-agencies'], ['agency']],
      successMessage: 'Agence mise à jour',
      errorMessage: 'Erreur lors de la mise à jour',
    }
  );
}

// Hook to toggle agency status (activate/deactivate)
export function useToggleAgencyStatus() {
  return useSupabaseMutation<Agency, {
    agencyId: number;
    isActive: boolean;
  }>(
    async ({ agencyId, isActive }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agencyId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Agency;
    },
    {
      invalidateQueries: [['agencies'], ['active-agencies'], ['agency']],
      successMessage: 'Statut de l\'agence modifié',
      errorMessage: 'Erreur lors de la modification du statut',
    }
  );
}

// Hook to assign a chef d'agence to an agency
export function useAssignChefAgence() {
  return useSupabaseMutation<Agency, {
    agencyId: number;
    chefAgenceId: string;
  }>(
    async ({ agencyId, chefAgenceId }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update({ 
          chef_agence_id: chefAgenceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agencyId)
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data as Agency;
    },
    {
      invalidateQueries: [['agencies'], ['agency']],
      successMessage: 'Chef d\'agence assigné',
      errorMessage: 'Erreur lors de l\'assignation',
    }
  );
}

// Hook to get agency statistics
export function useAgencyStats(agencyId?: number) {
  return useSupabaseQuery(
    ['agency-stats', agencyId],
    async () => {
      // Get agents count
      const { data: agentsData, error: agentsError } = await supabase
        .from('profiles')
        .select('id, is_active, balance')
        .eq('agency_id', agencyId)
        .eq('role_id', 1); // Assuming role_id 1 is for agents
      
      if (agentsError) throw agentsError;
      
      // Get operations stats for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('amount, status, created_at')
        .eq('agency_id', agencyId)
        .gte('created_at', startOfMonth.toISOString());
      
      if (operationsError) throw operationsError;
      
      const stats = {
        totalAgents: agentsData?.length || 0,
        activeAgents: agentsData?.filter(a => a.is_active)?.length || 0,
        totalBalance: agentsData?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0,
        monthlyOperations: operationsData?.length || 0,
        monthlyVolume: operationsData?.reduce((sum, op) => sum + (op.amount || 0), 0) || 0,
        validatedOperations: operationsData?.filter(op => op.status === 'validated')?.length || 0,
        pendingOperations: operationsData?.filter(op => op.status === 'pending')?.length || 0,
      };
      
      return stats;
    },
    {
      enabled: !!agencyId,
    }
  );
}