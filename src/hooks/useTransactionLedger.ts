
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TransactionLedgerEntry {
  id: string;
  user_id: string;
  operation_id?: string;
  transaction_type: 'debit' | 'credit' | 'commission' | 'fee' | 'recharge' | 'transfer';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const useTransactionLedger = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: ledgerEntries, isLoading } = useQuery({
    queryKey: ['transaction-ledger', userId],
    queryFn: async () => {
      let query = supabase
        .from('transaction_ledger')
        .select(`
          *,
          operations(reference_number, amount, status)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionLedgerEntry[];
    },
    enabled: !!userId,
  });

  const createLedgerEntryMutation = useMutation({
    mutationFn: async (entryData: Omit<TransactionLedgerEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transaction_ledger')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['developer-metrics'] });
    },
  });

  return {
    ledgerEntries: ledgerEntries || [],
    isLoading,
    createLedgerEntry: createLedgerEntryMutation.mutate,
    isCreating: createLedgerEntryMutation.isPending,
  };
};
