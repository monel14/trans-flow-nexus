
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface OperationType {
  id: string;
  name: string;
  description: string;
  impacts_balance: boolean;
  is_active: boolean;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
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
  validation_rules: any;
  options: any[];
  placeholder?: string;
  help_text?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionRule {
  id: string;
  operation_type_id: string;
  commission_type: 'fixed' | 'percentage' | 'tiered';
  fixed_amount?: number;
  percentage_rate?: number;
  tiered_rules: any[];
  min_amount: number;
  max_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useOperationTypes = () => {
  return useQuery({
    queryKey: ['operation-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operation_types')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OperationType[];
    },
  });
};

export const useOperationTypeFields = (operationTypeId?: string) => {
  return useQuery({
    queryKey: ['operation-type-fields', operationTypeId],
    queryFn: async () => {
      if (!operationTypeId) return [];
      
      const { data, error } = await supabase
        .from('operation_type_fields')
        .select('*')
        .eq('operation_type_id', operationTypeId)
        .order('display_order');
      
      if (error) throw error;
      return data as OperationTypeField[];
    },
    enabled: !!operationTypeId,
  });
};

export const useCommissionRules = (operationTypeId?: string) => {
  return useQuery({
    queryKey: ['commission-rules', operationTypeId],
    queryFn: async () => {
      if (!operationTypeId) return [];
      
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*')
        .eq('operation_type_id', operationTypeId);
      
      if (error) throw error;
      return data as CommissionRule[];
    },
    enabled: !!operationTypeId,
  });
};

export const useCreateOperationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (operationType: Omit<OperationType, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
      const { data, error } = await supabase
        .from('operation_types')
        .insert([operationType])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-types'] });
    },
  });
};

export const useUpdateOperationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperationType> & { id: string }) => {
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
};

export const useCreateOperationTypeField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (field: Omit<OperationTypeField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .insert([field])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields', variables.operation_type_id] });
    },
  });
};

export const useUpdateOperationTypeField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, operation_type_id, ...updates }: Partial<OperationTypeField> & { id: string; operation_type_id: string }) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields', variables.operation_type_id] });
    },
  });
};

export const useDeleteOperationTypeField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, operation_type_id }: { id: string; operation_type_id: string }) => {
      const { error } = await supabase
        .from('operation_type_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operation-type-fields', variables.operation_type_id] });
    },
  });
};

export const useCreateCommissionRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: Omit<CommissionRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('commission_rules')
        .insert([rule])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules', variables.operation_type_id] });
    },
  });
};

export const useUpdateCommissionRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, operation_type_id, ...updates }: Partial<CommissionRule> & { id: string; operation_type_id: string }) => {
      const { data, error } = await supabase
        .from('commission_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules', variables.operation_type_id] });
    },
  });
};
