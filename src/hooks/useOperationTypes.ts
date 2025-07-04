
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperationType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  impacts_balance: boolean;
  status: 'active' | 'inactive' | 'archived';
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

// Hook to get operation type fields
export function useOperationTypeFields(operationTypeId?: string) {
  return useQuery({
    queryKey: ['operation-type-fields', operationTypeId],
    queryFn: async (): Promise<OperationTypeField[]> => {
      if (!operationTypeId) return [];
      
      const { data, error } = await supabase
        .from('operation_type_fields')
        .select('*')
        .eq('operation_type_id', operationTypeId)
        .eq('is_obsolete', false)
        .order('display_order');

      if (error) throw error;
      return (data || []) as OperationTypeField[];
    },
    enabled: !!operationTypeId,
  });
}

// Hook to get commission rules
export function useCommissionRules(operationTypeId?: string) {
  return useQuery({
    queryKey: ['commission-rules', operationTypeId],
    queryFn: async (): Promise<CommissionRule[]> => {
      if (!operationTypeId) return [];
      
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*')
        .eq('operation_type_id', operationTypeId)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      return (data || []) as CommissionRule[];
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

// Hook to create an operation type field
export function useCreateOperationTypeField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: Omit<OperationTypeField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .insert(fieldData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

// Hook to update an operation type field
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

// Hook to delete an operation type field
export function useDeleteOperationTypeField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('operation_type_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields'] });
    },
  });
}

// Hook to create a commission rule
export function useCreateCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleData: Omit<CommissionRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('commission_rules')
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
    },
  });
}

// Hook to update a commission rule
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
    },
  });
}
