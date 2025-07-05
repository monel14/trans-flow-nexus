
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

export interface CommissionRule {
  id: string;
  operation_type_id: string;
  commission_type: 'fixed' | 'percentage' | 'tiered';
  fixed_amount?: number;
  percentage_rate?: number;
  min_amount?: number;
  max_amount?: number;
  tiered_rules?: any[];
  is_active: boolean;
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

        return (data || []).map(field => ({
          ...field,
          field_type: field.field_type as OperationTypeField['field_type'],
          options: Array.isArray(field.options) ? field.options.filter((opt): opt is string => typeof opt === 'string') : []
        }));
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

        const typedFields = (fields || []).map(field => ({
          ...field,
          field_type: field.field_type as OperationTypeField['field_type'],
          options: Array.isArray(field.options) ? field.options.filter((opt): opt is string => typeof opt === 'string') : []
        }));

        return {
          ...operationType,
          operation_type_fields: typedFields
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

        return (data || []).map(operationType => ({
          ...operationType,
          operation_type_fields: (operationType.operation_type_fields || []).map((field: any) => ({
            ...field,
            field_type: field.field_type as OperationTypeField['field_type'],
            options: Array.isArray(field.options) ? field.options.filter((opt): opt is string => typeof opt === 'string') : []
          }))
        }));
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

export function useCreateOperationTypeField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (field: Omit<OperationTypeField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .insert(field)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

export function useUpdateOperationTypeField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OperationTypeField> }) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
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
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

export function useDeleteOperationTypeField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('operation_type_fields')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

export function useCommissionRules(operationTypeId?: string) {
  return useQuery({
    queryKey: ['commission-rules', operationTypeId],
    queryFn: async (): Promise<CommissionRule[]> => {
      if (!operationTypeId) return [];

      try {
        const { data, error } = await supabase
          .from('commission_rules')
          .select('*')
          .eq('operation_type_id', operationTypeId)
          .order('created_at');

        if (error) {
          console.error('Error fetching commission rules:', error);
          return [];
        }

        return (data || []).map(rule => ({
          ...rule,
          commission_type: rule.commission_type as CommissionRule['commission_type']
        }));
      } catch (error) {
        console.error('Error in useCommissionRules:', error);
        return [];
      }
    },
    enabled: !!operationTypeId
  });
}

export function useCreateCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<CommissionRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('commission_rules')
        .insert(rule)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
    },
  });
}

export function useUpdateCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CommissionRule> }) => {
      const { data, error } = await supabase
        .from('commission_rules')
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
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
    },
  });
}

// Alias supprimé pour éviter le conflit de noms
// La fonction useOperationTypeFields existe déjà ligne 76
