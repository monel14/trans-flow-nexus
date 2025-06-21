import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Commission {
  id: string;
  agent_commission: number;
  chef_commission: number;
  total_commission: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  operation_id: string;
  agent_id: string;
  chef_agence_id: string | null;
  operations?: {
    reference_number: string;
    amount: number;
    currency: string;
    operation_types: {
      name: string;
    };
  };
}

export const useCommissions = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: commissions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['commissions', targetUserId],
    queryFn: async (): Promise<Commission[]> => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('commission_records')
        .select(`
          *,
          operations (
            reference_number,
            amount,
            currency,
            operation_types (name)
          )
        `)
        .eq('agent_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!targetUserId,
  });

  const totalCommissions = commissions.reduce((sum, commission) => 
    sum + commission.agent_commission, 0
  );

  const paidCommissions = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, commission) => sum + commission.agent_commission, 0);

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, commission) => sum + commission.agent_commission, 0);

  return {
    commissions,
    totalCommissions,
    paidCommissions,
    pendingCommissions,
    isLoading,
    error,
    refetch
  };
};

export const useCommissionsStats = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['commissions-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('commission_records')
        .select(`
          agent_commission,
          created_at,
          status,
          operations (
            operation_types (name)
          )
        `)
        .eq('agent_id', targetUserId);

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const thisMonth = data?.filter(c => 
        new Date(c.created_at) >= startOfMonth
      ) || [];

      const thisWeek = data?.filter(c => 
        new Date(c.created_at) >= startOfWeek
      ) || [];

      return {
        monthlyTotal: thisMonth.reduce((sum, c) => sum + c.agent_commission, 0),
        weeklyTotal: thisWeek.reduce((sum, c) => sum + c.agent_commission, 0),
        monthlyCount: thisMonth.length,
        weeklyCount: thisWeek.length,
      };
    },
    enabled: !!targetUserId,
  });
};