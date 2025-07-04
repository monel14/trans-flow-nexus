
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RechargeOperation {
  id: string;
  ticket_id: string;
  agent_id: string;
  amount: number;
  recharge_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  reference_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  balance_before: number;
  balance_after: number;
  metadata: any;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  request_tickets?: {
    title: string;
    description: string;
    ticket_number: string;
  };
  agent?: {
    name: string;
    email: string;
  };
}

export const useRechargeOperations = (filter?: {
  agent_id?: string;
  status?: string;
  ticket_id?: string;
}) => {
  const { data: operations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['recharge-operations', filter],
    queryFn: async (): Promise<RechargeOperation[]> => {
      let query = supabase
        .from('recharge_operations')
        .select(`
          *,
          request_tickets (
            title,
            description,
            ticket_number
          ),
          agent:profiles!recharge_operations_agent_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.agent_id) {
        query = query.eq('agent_id', filter.agent_id);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.ticket_id) {
        query = query.eq('ticket_id', filter.ticket_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recharge operations:', error);
        throw error;
      }

      // Transform the data to ensure proper typing
      const transformedData = (data || []).map(operation => ({
        ...operation,
        recharge_method: operation.recharge_method as 'cash' | 'bank_transfer' | 'mobile_money' | 'card',
        status: operation.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
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

export const useProcessRecharge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ticketId,
      amount,
      rechargeMethod,
      metadata = {}
    }: {
      ticketId: string;
      amount: number;
      rechargeMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
      metadata?: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('process_recharge_atomic', {
        body: {
          p_ticket_id: ticketId,
          p_agent_id: user.id,
          p_amount: amount,
          p_recharge_method: rechargeMethod,
          p_metadata: metadata
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recharge-operations'] });
      queryClient.invalidateQueries({ queryKey: ['recharge-requests'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
    },
  });
};
