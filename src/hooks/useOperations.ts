import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Operation {
  id: string;
  reference_number: string;
  operation_type_id: string;
  amount: number;
  status: 'pending' | 'pending_validation' | 'completed' | 'rejected';
  initiator_id: string;
  validator_id?: string;
  agency_id: number;
  operation_data: any;
  commission_amount?: number;
  fee_amount?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  validated_at?: string;
  updated_at: string;
  
  // Relations
  operation_types?: {
    id: string;
    name: string;
    description: string;
  };
  profiles?: {
    id: string;
    name: string;
    email: string;
  };
  agencies?: {
    id: number;
    name: string;
    city?: string;
  };
}

export interface CreateOperationData {
  operation_type_id: string;
  amount: number;
  operation_data: any;
  proof_file?: File;
}

// Hook to get operations for current user
export function useOperations(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
  operation_type_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['operations', user?.id, JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('operations')
        .select(`
          *,
          operation_types (id, name, description),
          profiles!operations_initiator_id_fkey (id, name, email),
          agencies (id, name, city)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.operation_type_id) {
        query = query.eq('operation_type_id', filters.operation_type_id);
      }
      
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to get a single operation
export function useOperation(operationId: string) {
  return useSupabaseQuery(
    ['operation', operationId],
    async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (id, name, description),
          profiles!operations_initiator_id_fkey (id, name, email),
          agencies (id, name, city),
          operation_validations (
            id,
            validation_status,
            validation_notes,
            validated_at,
            profiles!operation_validations_validator_id_fkey (id, name)
          )
        `)
        .eq('id', operationId)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    {
      enabled: !!operationId,
    }
  );
}

// Hook to create a new operation
export function useCreateOperation() {
  const { user } = useAuth();
  
  return useSupabaseMutation<Operation, CreateOperationData>(
    async (operationData) => {
      // Generate reference number
      const timestamp = Date.now();
      const reference = `OP-${timestamp}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Upload proof file if provided
      let proofUrl = null;
      if (operationData.proof_file) {
        const fileExt = operationData.proof_file.name.split('.').pop();
        const fileName = `${user?.id}/${timestamp}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('operation-proofs')
          .upload(fileName, operationData.proof_file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('operation-proofs')
          .getPublicUrl(fileName);
        
        proofUrl = urlData.publicUrl;
      }
      
      // Create operation
      const { data, error } = await supabase
        .from('operations')
        .insert({
          reference_number: reference,
          operation_type_id: operationData.operation_type_id,
          amount: operationData.amount,
          operation_data: {
            ...operationData.operation_data,
            proof_url: proofUrl,
          },
          initiator_id: user?.id,
          agency_id: user?.agenceId ? parseInt(user.agenceId) : null,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Operation;
    },
    {
      invalidateQueries: [['operations']],
      successMessage: 'Opération créée avec succès',
      errorMessage: 'Erreur lors de la création de l\'opération',
    }
  );
}

// Hook to get operations pending validation (for admins)
export function usePendingOperations() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['pending-operations', user?.role],
    async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (id, name, description),
          profiles!operations_initiator_id_fkey (id, name, email),
          agencies (id, name, city)
        `)
        .in('status', ['pending', 'pending_validation'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    },
    {
      enabled: user?.role && ['admin_general', 'sous_admin'].includes(user.role),
    }
  );
}

// Hook to validate an operation (for admins)
export function useValidateOperation() {
  return useSupabaseMutation<any, {
    operation_id: string;
    action: 'approve' | 'reject';
    notes?: string;
  }>(
    async ({ operation_id, action, notes }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate_operation_atomic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          operation_id,
          action,
          notes,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la validation');
      }
      
      return result;
    },
    {
      invalidateQueries: [['operations'], ['pending-operations']],
      successMessage: 'Opération validée avec succès',
      errorMessage: 'Erreur lors de la validation',
    }
  );
}