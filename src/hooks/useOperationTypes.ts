
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperationType {
  id: string;
  name: string;
  description: string;
  impacts_balance: boolean;
  is_active: boolean;
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
  field_type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'file' | 'date' | 'checkbox' | 'radio';
  is_required: boolean;
  is_obsolete: boolean;
  display_order: number;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  validation_rules?: any;
  created_at: string;
  updated_at: string;
}

export function useOperationTypes() {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      try {
        const { data, error } = await supabase
          .from('operation_types')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Error fetching operation types:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in useOperationTypes:', error);
        return [];
      }
    }
  });
}

export function useOperationTypeFields(operationTypeId: string) {
  return useQuery({
    queryKey: ['operation-type-fields', operationTypeId],
    queryFn: async (): Promise<OperationTypeField[]> => {
      if (!operationTypeId) return [];

      try {
        const { data, error } = await supabase
          .from('operation_type_fields')
          .select('*')
          .eq('operation_type_id', operationTypeId)
          .eq('is_obsolete', false)
          .order('display_order');

        if (error) {
          console.error('Error fetching operation type fields:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in useOperationTypeFields:', error);
        return [];
      }
    },
    enabled: !!operationTypeId
  });
}

export function useOperationTypeWithFields(operationTypeId: string) {
  return useQuery({
    queryKey: ['operation-type-with-fields', operationTypeId],
    queryFn: async (): Promise<OperationType | null> => {
      if (!operationTypeId) return null;

      try {
        const { data: operationType, error: typeError } = await supabase
          .from('operation_types')
          .select('*')
          .eq('id', operationTypeId)
          .single();

        if (typeError) {
          console.error('Error fetching operation type:', typeError);
          return null;
        }

        const { data: fields, error: fieldsError } = await supabase
          .from('operation_type_fields')
          .select('*')
          .eq('operation_type_id', operationTypeId)
          .eq('is_obsolete', false)
          .order('display_order');

        if (fieldsError) {
          console.error('Error fetching operation type fields:', fieldsError);
          return operationType;
        }

        return {
          ...operationType,
          operation_type_fields: fields || []
        };
      } catch (error) {
        console.error('Error in useOperationTypeWithFields:', error);
        return null;
      }
    },
    enabled: !!operationTypeId
  });
}

export function useAllOperationTypes() {
  return useQuery({
    queryKey: ['all-operation-types'],
    queryFn: async (): Promise<OperationType[]> => {
      try {
        const { data, error } = await supabase
          .from('operation_types')
          .select(`
            *,
            operation_type_fields (*)
          `)
          .order('name');

        if (error) {
          console.error('Error fetching all operation types:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in useAllOperationTypes:', error);
        return [];
      }
    }
  });
}

export function useCreateOperationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationType: Omit<OperationType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('operation_types')
        .insert(operationType)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-operation-types'] });
    },
  });
}

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

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-operation-types'] });
    },
  });
}
