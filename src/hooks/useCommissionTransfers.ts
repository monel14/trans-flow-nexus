
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommissionTransfer {
  id: string;
  commission_record_id: string;
  transfer_type: 'agent_payment' | 'chef_payment' | 'bulk_transfer';
  recipient_id: string;
  amount: number;
  transfer_method: 'balance_credit' | 'bank_transfer' | 'mobile_money' | 'cash';
  reference_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transfer_data: any;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  commission_records?: {
    agent_commission: number;
    chef_commission: number;
    status: string;
  };
  recipient?: {
    name: string;
    email: string;
  };
}

export const useCommissionTransfers = (filter?: {
  recipient_id?: string;
  status?: string;
  transfer_type?: string;
}) => {
  const { data: transfers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['commission-transfers', filter],
    queryFn: async (): Promise<CommissionTransfer[]> => {
      let query = supabase
        .from('commission_transfers')
        .select(`
          *,
          commission_records (
            agent_commission,
            chef_commission,
            status
          ),
          recipient:profiles!commission_transfers_recipient_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.recipient_id) {
        query = query.eq('recipient_id', filter.recipient_id);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.transfer_type) {
        query = query.eq('transfer_type', filter.transfer_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching commission transfers:', error);
        throw error;
      }

      // Transform the data to ensure proper typing
      const transformedData = (data || []).map(transfer => ({
        ...transfer,
        transfer_type: transfer.transfer_type as 'agent_payment' | 'chef_payment' | 'bulk_transfer',
        transfer_method: transfer.transfer_method as 'balance_credit' | 'bank_transfer' | 'mobile_money' | 'cash',
        status: transfer.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
      }));

      return transformedData;
    },
  });

  return {
    transfers,
    isLoading,
    error,
    refetch
  };
};

export const useTransferCommission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      commissionRecordId,
      transferType,
      recipientId,
      amount,
      transferMethod,
      transferData = {}
    }: {
      commissionRecordId: string;
      transferType: 'agent_payment' | 'chef_payment' | 'bulk_transfer';
      recipientId: string;
      amount: number;
      transferMethod: 'balance_credit' | 'bank_transfer' | 'mobile_money' | 'cash';
      transferData?: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('process_commission_transfer_atomic', {
        body: {
          p_commission_record_id: commissionRecordId,
          p_transfer_type: transferType,
          p_recipient_id: recipientId,
          p_amount: amount,
          p_transfer_method: transferMethod,
          p_transfer_data: transferData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['commission-records'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
    },
  });
};

export const useBulkTransferCommissions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      commissionRecordIds,
      transferMethod,
      transferData = {}
    }: {
      commissionRecordIds: string[];
      transferMethod: 'balance_credit' | 'bank_transfer' | 'mobile_money' | 'cash';
      transferData?: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const results = [];
      for (const recordId of commissionRecordIds) {
        const { data, error } = await supabase.functions.invoke('process_commission_transfer_atomic', {
          body: {
            p_commission_record_id: recordId,
            p_transfer_type: 'bulk_transfer',
            p_recipient_id: user.id,
            p_amount: 0, // Amount will be determined by the record
            p_transfer_method: transferMethod,
            p_transfer_data: transferData
          }
        });

        if (error) throw error;
        results.push(data);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['commission-records'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
    },
  });
};
