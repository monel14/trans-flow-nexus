
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperationType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  impacts_balance: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  operation_type_fields?: OperationTypeField[];
}

export interface OperationTypeField {
  id: string;
  operation_type_id: string;
  name: string;
  label: string;
  field_type: string;
  is_required: boolean;
  is_obsolete: boolean;
  display_order: number;
  placeholder?: string;
  help_text?: string;
  options?: any[];
  validation_rules?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateOperationTypeData {
  name: string;
  description: string;
  impacts_balance?: boolean;
}

// Hook to get all operation types
export function useOperationTypes() {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      const { data, error } = await supabase
        .from('operation_types')
        .select(`
          *,
          operation_type_fields (*)
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return (data || []) as OperationType[];
    }
  });
}

// Hook to get a single operation type
export function useOperationType(operationTypeId: string) {
  return useQuery({
    queryKey: ['operation-type', operationTypeId],
    queryFn: async (): Promise<OperationType> => {
      const { data, error } = await supabase
        .from('operation_types')
        .select(`
          *,
          operation_type_fields (*)
        `)
        .eq('id', operationTypeId)
        .single();

      if (error) throw error;
      return data as OperationType;
    },
    enabled: !!operationTypeId,
  });
}

// Hook to create an operation type
export function useCreateOperationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationTypeData: CreateOperationTypeData) => {
      const { data, error } = await supabase
        .from('operation_types')
        .insert(operationTypeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
    },
  });
}

// Hook to update an operation type
export function useUpdateOperationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OperationType> }) => {
      const { data, error } = await supabase
        .from('operation_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
    },
  });
}

// Hook to delete an operation type
export function useDeleteOperationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationTypeId: string) => {
      const { error } = await supabase
        .from('operation_types')
        .update({ is_active: false, status: 'inactive' })
        .eq('id', operationTypeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
    },
  });
}
