
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Operation {
  id: string;
  reference_number: string;
  operation_type_id: string;
  initiator_id: string;
  agency_id: number;
  amount: number;
  currency: string;
  status: string;
  operation_data: any;
  commission_amount: number | null;
  fee_amount: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  validated_at: string | null;
  validator_id: string | null;
  operation_types?: {
    name: string;
    description: string;
  };
  initiator?: {
    name: string;
    email: string;
  } | null;
  agencies?: {
    name: string;
    city: string;
  };
}

export const useOperations = (filter?: {
  initiator_id?: string;
  agency_id?: number;
  status?: string;
  operation_type_id?: string;
}) => {
  const { data: operations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['operations', filter],
    queryFn: async (): Promise<Operation[]> => {
      let query = supabase
        .from('operations')
        .select(`
          *,
          operation_types (
            name,
            description
          ),
          initiator:profiles!operations_initiator_id_fkey (
            name,
            email
          ),
          agencies (
            name,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.initiator_id) {
        query = query.eq('initiator_id', filter.initiator_id);
      }

      if (filter?.agency_id) {
        query = query.eq('agency_id', filter.agency_id);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.operation_type_id) {
        query = query.eq('operation_type_id', filter.operation_type_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operations:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(operation => ({
        ...operation,
        initiator: (operation.initiator && 
          typeof operation.initiator === 'object' && 
          'name' in operation.initiator &&
          operation.initiator.name !== null)
          ? operation.initiator as { name: string; email: string }
          : null
      }));

      return transformedData;
    },
  });

  return {
    operations,
    isLoading,
    error,
    refetch
  };
};
