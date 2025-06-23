
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OperationValidation {
  id: string;
  operation_id: string;
  validator_id: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  validation_notes: string | null;
  balance_impact: number;
  commission_calculated: number;
  validation_data: any;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  operations?: {
    reference_number: string;
    amount: number;
    status: string;
    initiator_id: string;
  };
  validator?: {
    name: string;
    email: string;
  };
}

export const useOperationValidations = (filter?: {
  validator_id?: string;
  operation_id?: string;
  status?: string;
}) => {
  const { data: validations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['operation-validations', filter],
    queryFn: async (): Promise<OperationValidation[]> => {
      let query = supabase
        .from('operation_validations')
        .select(`
          *,
          operations (
            reference_number,
            amount,
            status,
            initiator_id
          ),
          validator:profiles!operation_validations_validator_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.validator_id) {
        query = query.eq('validator_id', filter.validator_id);
      }

      if (filter?.operation_id) {
        query = query.eq('operation_id', filter.operation_id);
      }

      if (filter?.status) {
        query = query.eq('validation_status', filter.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operation validations:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    validations,
    isLoading,
    error,
    refetch
  };
};

export const useValidateOperation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      operationId,
      validationStatus,
      validationNotes,
      balanceImpact,
      commissionCalculated
    }: {
      operationId: string;
      validationStatus: 'approved' | 'rejected';
      validationNotes?: string;
      balanceImpact: number;
      commissionCalculated: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('validate_operation_atomic', {
        p_operation_id: operationId,
        p_validator_id: user.id,
        p_validation_status: validationStatus,
        p_validation_notes: validationNotes || null,
        p_balance_impact: balanceImpact,
        p_commission_calculated: commissionCalculated
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-validations'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
    },
  });
};
