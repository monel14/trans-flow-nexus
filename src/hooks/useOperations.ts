
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Operation {
  id: string;
  operation_type_id: string;
  reference_number: string;
  initiator_id: string;
  agency_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  operation_data: Record<string, any>;
  fee_amount?: number;
  commission_amount?: number;
  validator_id?: string;
  validated_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useOperations = (filters?: {
  status?: string;
  agency_id?: number;
  initiator_id?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: operations, isLoading, error } = useQuery({
    queryKey: ['operations', filters],
    queryFn: async () => {
      let query = supabase
        .from('operations')
        .select(`
          *,
          operation_types(name, description),
          profiles!operations_initiator_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.agency_id) {
        query = query.eq('agency_id', filters.agency_id);
      }
      if (filters?.initiator_id) {
        query = query.eq('initiator_id', filters.initiator_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Operation[];
    },
  });

  const createOperationMutation = useMutation({
    mutationFn: async (operationData: Omit<Operation, 'id' | 'created_at' | 'updated_at' | 'reference_number'>) => {
      // Générer un numéro de référence unique
      const reference_number = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('operations')
        .insert([{ ...operationData, reference_number }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const updateOperationMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Operation> & { id: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  return {
    operations: operations || [],
    isLoading,
    error,
    createOperation: createOperationMutation.mutate,
    updateOperation: updateOperationMutation.mutate,
    isCreating: createOperationMutation.isPending,
    isUpdating: updateOperationMutation.isPending,
  };
};
