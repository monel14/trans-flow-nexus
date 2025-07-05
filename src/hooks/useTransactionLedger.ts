import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionLedgerEntry {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  operation_id: string | null;
  metadata: any;
  created_at: string;
}

export const useTransactionLedger = (userId?: string) => {
  const { data: ledgerEntries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transaction-ledger', userId],
    queryFn: async (): Promise<TransactionLedgerEntry[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('transaction_ledger')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transaction ledger:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });

  return {
    ledgerEntries,
    isLoading,
    error,
    refetch
  };
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: {
      user_id: string;
      transaction_type: string;
      amount: number;
      description: string;
      operation_id?: string;
      metadata?: any;
    }) => {
      // First, get current balance
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', transactionData.user_id)
        .single();

      if (profileError) throw profileError;

      const currentBalance = currentProfile?.balance || 0;
      const newBalance = currentBalance + transactionData.amount;

      // Insert transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transaction_ledger')
        .insert({
          user_id: transactionData.user_id,
          transaction_type: transactionData.transaction_type,
          amount: transactionData.amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: transactionData.description,
          operation_id: transactionData.operation_id,
          metadata: transactionData.metadata,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', transactionData.user_id);

      if (updateError) throw updateError;

      return transaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['transaction-ledger', variables.user_id] 
      });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};