import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  validation_rules?: any;
  options?: string[];
  placeholder?: string;
  help_text?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationTypeWithFields extends OperationType {
  operation_type_fields: OperationTypeField[];
}

// Hook to get all active operation types
export function useOperationTypes() {
  return useSupabaseQuery(
    ['operation-types'],
    async () => {
      const { data, error } = await supabase
        .from('operation_types')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data as OperationType[];
    }
  );
}

// Hook to get operation types for current user's agency
export function useAgencyOperationTypes() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['agency-operation-types', user?.agenceId],
    async () => {
      if (!user?.agenceId) return [];
      
      const { data, error } = await supabase
        .from('agency_operation_types')
        .select(`
          *,
          operation_types (*)
        `)
        .eq('agency_id', parseInt(user.agenceId))
        .eq('is_enabled', true);
      
      if (error) throw error;
      
      return data.map(item => item.operation_types).filter(Boolean) as OperationType[];
    },
    {
      enabled: !!user?.agenceId,
    }
  );
}

// Hook to get operation type with its fields
export function useOperationTypeWithFields(operationTypeId: string) {
  return useSupabaseQuery(
    ['operation-type-with-fields', operationTypeId],
    async () => {
      const { data, error } = await supabase
        .from('operation_types')
        .select(`
          *,
          operation_type_fields (*)
        `)
        .eq('id', operationTypeId)
        .single();
      
      if (error) throw error;
      
      // Sort fields by display_order
      if (data.operation_type_fields) {
        data.operation_type_fields.sort((a: OperationTypeField, b: OperationTypeField) => 
          a.display_order - b.display_order
        );
      }
      
      return data as OperationTypeWithFields;
    },
    {
      enabled: !!operationTypeId,
    }
  );
}

// Hook to create operation type (developers only)
export function useCreateOperationType() {
  const { user } = useAuth();
  
  return useSupabaseMutation<OperationType, Omit<OperationType, 'id' | 'created_at' | 'updated_at'>>(
    async (operationTypeData) => {
      const { data, error } = await supabase
        .from('operation_types')
        .insert({
          ...operationTypeData,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as OperationType;
    },
    {
      invalidateQueries: [['operation-types']],
      successMessage: 'Type d\'opération créé avec succès',
      errorMessage: 'Erreur lors de la création du type d\'opération',
    }
  );
}

// Hook to update operation type (developers only)
export function useUpdateOperationType() {
  const { user } = useAuth();
  
  return useSupabaseMutation<OperationType, { id: string; updates: Partial<OperationType> }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('operation_types')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as OperationType;
    },
    {
      invalidateQueries: [['operation-types'], ['operation-type-with-fields']],
      successMessage: 'Type d\'opération mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour du type d\'opération',
    }
  );
}

// Hook to create operation type field (developers only)
export function useCreateOperationTypeField() {
  return useSupabaseMutation<OperationTypeField, Omit<OperationTypeField, 'id' | 'created_at' | 'updated_at'>>(
    async (fieldData) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .insert(fieldData)
        .select()
        .single();
      
      if (error) throw error;
      return data as OperationTypeField;
    },
    {
      invalidateQueries: [['operation-type-with-fields']],
      successMessage: 'Champ ajouté avec succès',
      errorMessage: 'Erreur lors de l\'ajout du champ',
    }
  );
}

// Hook to update operation type field (developers only)
export function useUpdateOperationTypeField() {
  return useSupabaseMutation<OperationTypeField, { id: string; updates: Partial<OperationTypeField> }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('operation_type_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as OperationTypeField;
    },
    {
      invalidateQueries: [['operation-type-with-fields']],
      successMessage: 'Champ mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour du champ',
    }
  );
}

// Hook to delete operation type field (developers only)
export function useDeleteOperationTypeField() {
  return useSupabaseMutation<void, string>(
    async (fieldId) => {
      const { error } = await supabase
        .from('operation_type_fields')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
    },
    {
      invalidateQueries: [['operation-type-with-fields']],
      successMessage: 'Champ supprimé avec succès',
      errorMessage: 'Erreur lors de la suppression du champ',
    }
  );
}