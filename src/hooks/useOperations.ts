
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Operation {
  id: string;
  operation_type_id: string;
  initiator_id: string;
  agency_id: number;
  amount: number;
  currency: string;
  status: string;
  reference_number: string;
  operation_data: any;
  commission_amount?: number;
  fee_amount?: number;
  error_message?: string;
  validator_id?: string;
  validated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  operation_type?: {
    name: string;
    description: string;
  };
  profiles?: {
    name: string;
  };
  agencies?: {
    name: string;
  };
}

export interface OperationFilters {
  status?: string;
  operation_type_id?: string;
  date_from?: string;
  date_to?: string;
}

export function useOperations(filters?: OperationFilters) {
  return useQuery({
    queryKey: ['operations', filters],
    queryFn: async (): Promise<Operation[]> => {
      try {
        let query = supabase
          .from('operations')
          .select(`
            *,
            operation_types:operation_type_id (name, description),
            profiles:initiator_id (name),
            agencies:agency_id (name)
          `)
          .order('created_at', { ascending: false });

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

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching operations:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in useOperations:', error);
        return [];
      }
    }
  });
}

export function useCreateOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationData: {
      operation_type_id: string;
      amount: number;
      operation_data: any;
    }) => {
      const { data, error } = await supabase
        .from('operations')
        .insert({
          ...operationData,
          status: 'pending',
          reference_number: `OP-${Date.now()}`,
          agency_id: 1, // Default agency for now
          initiator_id: (await supabase.auth.getUser()).data.user?.id || '',
          currency: 'XOF'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}

export function useUpdateOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Operation> }) => {
      const { data, error } = await supabase
        .from('operations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}

export function useValidateOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      operation_id, 
      action, 
      notes 
    }: { 
      operation_id: string; 
      action: 'approve' | 'reject'; 
      notes?: string; 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('validate_operation_atomic', {
        p_operation_id: operation_id,
        p_validator_id: user.user.id,
        p_action: action,
        p_notes: notes
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
      queryClient.invalidateQueries({ queryKey: ['operations-by-queue'] });
    },
  });
}
