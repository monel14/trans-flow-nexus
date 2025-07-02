import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Commission {
  id: string;
  operation_id: string;
  agent_id: string;
  chef_agence_id?: string;
  agent_commission: number;
  chef_commission?: number;
  total_commission: number;
  commission_rule_id: string;
  calculation_base: string;
  status: 'pending' | 'paid' | 'processing';
  paid_at?: string;
  created_at: string;
  
  // Relations
  operation?: {
    id: string;
    reference_number: string;
    amount: number;
    created_at: string;
    operation_types?: {
      id: string;
      name: string;
      description: string;
    };
  };
  commission_rule?: {
    id: string;
    rule_type: 'percentage' | 'fixed';
    percentage?: number;
    fixed_amount?: number;
  };
}

export interface CommissionSummary {
  total_pending: number;
  total_paid: number;
  current_month: number;
  last_month: number;
  current_year: number;
}

// Hook to get commissions for a user
export function useCommissions(userId?: string, filters?: {
  period?: string;
  status?: string;
  limit?: number;
}) {
  return useSupabaseQuery(
    ['commissions', userId, JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('commission_records')
        .select(`
          *,
          operations (
            id,
            reference_number,
            amount,
            created_at,
            operation_types (id, name, description)
          ),
          commission_rules (
            id,
            rule_type,
            percentage,
            fixed_amount
          )
        `)
        .eq('agent_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.period) {
        const now = new Date();
        let dateFrom: Date;
        
        switch (filters.period) {
          case 'current-month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'last-month':
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const dateTo = new Date(now.getFullYear(), now.getMonth(), 0);
            query = query.gte('created_at', dateFrom.toISOString())
                        .lte('created_at', dateTo.toISOString());
            break;
          case 'current-year':
            dateFrom = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            dateFrom = new Date(0); // All time
        }
        
        if (filters.period !== 'last-month' && filters.period !== 'all') {
          query = query.gte('created_at', dateFrom.toISOString());
        }
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    {
      enabled: !!userId,
    }
  );
}

// Hook to get commission summary
export function useCommissionSummary(userId?: string) {
  return useSupabaseQuery(
    ['commission-summary', userId],
    async () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const currentYearStart = new Date(now.getFullYear(), 0, 1);

      // Get all commissions for calculations
      const { data: allCommissions, error } = await supabase
        .from('commission_records')
        .select('agent_commission, status, created_at')
        .eq('agent_id', userId);

      if (error) throw error;

      const summary: CommissionSummary = {
        total_pending: 0,
        total_paid: 0,
        current_month: 0,
        last_month: 0,
        current_year: 0
      };

      allCommissions?.forEach(commission => {
        const createdAt = new Date(commission.created_at);
        const amount = commission.agent_commission;

        // Status-based totals
        if (commission.status === 'pending') {
          summary.total_pending += amount;
        } else if (commission.status === 'paid') {
          summary.total_paid += amount;
        }

        // Period-based totals
        if (createdAt >= currentMonthStart) {
          summary.current_month += amount;
        }
        
        if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
          summary.last_month += amount;
        }
        
        if (createdAt >= currentYearStart) {
          summary.current_year += amount;
        }
      });

      return summary;
    },
    {
      enabled: !!userId,
    }
  );
}

// Hook to transfer commissions to balance (for Chef d'agence)
export function useTransferCommissions() {
  return useSupabaseMutation<any, {
    commission_ids: string[];
    transfer_type: 'agent_payment' | 'chef_payment' | 'bulk_transfer';
  }>(
    async ({ commission_ids, transfer_type }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process_commission_transfer_atomic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          commission_ids,
          transfer_type,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du transfert');
      }
      
      return result;
    },
    {
      invalidateQueries: [['commissions'], ['commission-summary'], ['transaction-ledger']],
      successMessage: 'Commissions transférées avec succès',
      errorMessage: 'Erreur lors du transfert des commissions',
    }
  );
}

// Alias pour compatibilité avec les composants existants
export const useCommissionsStats = useCommissionSummary;