
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Operation {
  id: string;
  reference_number: string;
  amount: number;
  currency: string;
  status: string;
  operation_type?: {
    name: string;
  };
  profiles?: {
    name: string;
  };
  created_at: string;
  operation_type_id: string;
  initiator_id: string;
  agency_id: number;
  operation_data: any;
  fee_amount?: number;
  commission_amount?: number;
  validator_id?: string;
  validated_at?: string;
  completed_at?: string;
  error_message?: string;
  updated_at: string;
}

export interface CreateOperationData {
  operation_type_id: string;
  amount: number;
  operation_data: Record<string, any>;
  reference_number?: string;
}

export interface OperationFilters {
  status?: string;
  limit?: number;
  offset?: number;
  operation_type_id?: string;
  date_from?: string;
  date_to?: string;
}

// Hook to get operations
export function useOperations(filters?: OperationFilters) {
  return useQuery({
    queryKey: ['operations', filters],
    queryFn: async (): Promise<Operation[]> => {
      let query = supabase
        .from('operations')
        .select(`
          *,
          operation_types (name, description),
          profiles!operations_initiator_id_fkey (name, email)
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

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset && filters?.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Operation interface
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        operation_type: item.operation_types ? { name: item.operation_types.name } : undefined,
        profiles: item.profiles?.[0] ? { name: item.profiles[0].name } : undefined
      }));

      return transformedData as Operation[];
    }
  });
}

// Hook to create an operation
export function useCreateOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (operationData: CreateOperationData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get user's agency_id
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.agency_id) {
        throw new Error('User agency not found');
      }

      const { data, error } = await supabase
        .from('operations')
        .insert({
          ...operationData,
          reference_number: operationData.reference_number || `OP-${Date.now()}`,
          status: 'pending',
          initiator_id: user.id,
          agency_id: userProfile.agency_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}

// Hook to get a single operation
export function useOperation(operationId: string) {
  return useQuery({
    queryKey: ['operation', operationId],
    queryFn: async (): Promise<Operation> => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (name, description),
          profiles!operations_initiator_id_fkey (name, email)
        `)
        .eq('id', operationId)
        .single();

      if (error) throw error;

      // Transform the data to match our Operation interface
      const transformedData = {
        ...data,
        operation_type: data.operation_types ? { name: data.operation_types.name } : undefined,
        profiles: data.profiles?.[0] ? { name: data.profiles[0].name } : undefined
      };

      return transformedData as Operation;
    },
    enabled: !!operationId,
  });
}

// Hook to update an operation
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}
