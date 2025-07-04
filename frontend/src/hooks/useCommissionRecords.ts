
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommissionRecord {
  id: string;
  operation_id: string;
  agent_id: string;
  chef_agence_id?: string;
  commission_rule_id: string;
  agent_commission: number;
  chef_commission: number;
  total_commission: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export const useCommissionRecords = (filters?: {
  agent_id?: string;
  status?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: commissionRecords, isLoading } = useQuery({
    queryKey: ['commission-records', filters],
    queryFn: async () => {
      let query = supabase
        .from('commission_records')
        .select(`
          *,
          operations(reference_number, amount, operation_types(name)),
          profiles!commission_records_agent_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommissionRecord[];
    },
  });

  const updateCommissionStatusMutation = useMutation({
    mutationFn: async ({ id, status, paid_at }: { id: string; status: string; paid_at?: string }) => {
      const updates: any = { status };
      if (paid_at) updates.paid_at = paid_at;

      const { data, error } = await supabase
        .from('commission_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-records'] });
    },
  });

  return {
    commissionRecords: commissionRecords || [],
    isLoading,
    updateCommissionStatus: updateCommissionStatusMutation.mutate,
    isUpdating: updateCommissionStatusMutation.isPending,
  };
};
