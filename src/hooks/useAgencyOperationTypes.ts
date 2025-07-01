import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';

export interface AgencyOperationType {
  id: string;
  agency_id: number;
  operation_type_id: string;
  is_active: boolean;
  created_at: string;
  
  // Relations
  operation_types?: {
    id: string;
    name: string;
    description: string;
    affects_balance: boolean;
  };
  agencies?: {
    id: number;
    name: string;
    city: string;
  };
}

// Hook to get operation types for a specific agency
export function useAgencyOperationTypes(agencyId?: string | number) {
  return useSupabaseQuery(
    ['agency-operation-types', agencyId],
    async () => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (id, name, description, affects_balance),
          agencies (id, name, city)
        `)
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AgencyOperationType[];
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to get all agency-operation type mappings (for admin)
export function useAllAgencyOperationTypes() {
  return useSupabaseQuery(
    ['all-agency-operation-types'],
    async () => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (id, name, description, affects_balance),
          agencies (id, name, city)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AgencyOperationType[];
    }
  );
}

// Hook to update agency services (assign/revoke operation types)
export function useUpdateAgencyServices() {
  return useSupabaseMutation<any, {
    agencyId: string | number;
    operationTypeIds: string[];
  }>(
    async ({ agencyId, operationTypeIds }) => {
      // First, deactivate all current services for this agency
      const { error: deactivateError } = await supabase
        .from('agency_operation_types')
        .update({ is_active: false })
        .eq('agency_id', agencyId);
      
      if (deactivateError) throw deactivateError;
      
      // Then, activate/create the selected services
      if (operationTypeIds.length > 0) {
        // Check which ones already exist
        const { data: existing } = await supabase
          .from('agency_operation_types')
          .select('operation_type_id')
          .eq('agency_id', agencyId)
          .in('operation_type_id', operationTypeIds);
        
        const existingIds = existing?.map(e => e.operation_type_id) || [];
        
        // Update existing ones to active
        if (existingIds.length > 0) {
          const { error: updateError } = await supabase
            .from('agency_operation_types')
            .update({ is_active: true })
            .eq('agency_id', agencyId)
            .in('operation_type_id', existingIds);
          
          if (updateError) throw updateError;
        }
        
        // Create new ones
        const newIds = operationTypeIds.filter(id => !existingIds.includes(id));
        if (newIds.length > 0) {
          const newRecords = newIds.map(operationTypeId => ({
            agency_id: parseInt(agencyId.toString()),
            operation_type_id: operationTypeId,
            is_active: true,
          }));
          
          const { error: insertError } = await supabase
            .from('agency_operation_types')
            .insert(newRecords);
          
          if (insertError) throw insertError;
        }
      }
      
      return { success: true };
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types'], ['operation-types']],
      successMessage: 'Services de l\'agence mis à jour',
      errorMessage: 'Erreur lors de la mise à jour des services',
    }
  );
}

// Hook to assign a single operation type to an agency
export function useAssignOperationTypeToAgency() {
  return useSupabaseMutation<AgencyOperationType, {
    agencyId: number;
    operationTypeId: string;
  }>(
    async ({ agencyId, operationTypeId }) => {
      // Check if the assignment already exists
      const { data: existing } = await supabase
        .from('agency_operation_types')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('operation_type_id', operationTypeId)
        .single();
      
      if (existing) {
        // If it exists but is inactive, reactivate it
        if (!existing.is_active) {
          const { data, error } = await supabase
            .from('agency_operation_types')
            .update({ is_active: true })
            .eq('id', existing.id)
            .select()
            .single();
          
          if (error) throw error;
          return data as AgencyOperationType;
        }
        
        return existing as AgencyOperationType;
      } else {
        // Create new assignment
        const { data, error } = await supabase
          .from('agency_operation_types')
          .insert({
            agency_id: agencyId,
            operation_type_id: operationTypeId,
            is_active: true,
          })
          .select(`
            *,
            operation_types (id, name, description, affects_balance),
            agencies (id, name, city)
          `)
          .single();
        
        if (error) throw error;
        return data as AgencyOperationType;
      }
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types']],
      successMessage: 'Service assigné à l\'agence',
      errorMessage: 'Erreur lors de l\'assignation',
    }
  );
}

// Hook to revoke an operation type from an agency
export function useRevokeOperationTypeFromAgency() {
  return useSupabaseMutation<any, {
    agencyId: number;
    operationTypeId: string;
  }>(
    async ({ agencyId, operationTypeId }) => {
      const { data, error } = await supabase
        .from('agency_operation_types')
        .update({ is_active: false })
        .eq('agency_id', agencyId)
        .eq('operation_type_id', operationTypeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['agency-operation-types'], ['all-agency-operation-types']],
      successMessage: 'Service retiré de l\'agence',
      errorMessage: 'Erreur lors du retrait',
    }
  );
}