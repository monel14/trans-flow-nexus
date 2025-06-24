import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Commission {
  id: string;
  operation_id: string;
  agent_id: string;
  chef_agence_id?: string;
  commission_rule_id: string;
  agent_commission: number;
  chef_commission: number;
  total_commission: number;
  status: 'earned' | 'pending_transfer' | 'partially_paid' | 'paid';
  paid_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  operations?: {
    id: string;
    reference_number: string;
    amount: number;
    operation_types: {
      name: string;
    };
  };
  agent?: {
    id: string;
    name: string;
  };
  chef_agence?: {
    id: string;
    name: string;
  };
}

export interface CommissionTransfer {
  id: string;
  commission_record_id: string;
  transfer_type: 'agent_payment' | 'chef_payment' | 'bulk_transfer';
  recipient_id: string;
  amount: number;
  transfer_method: string;
  reference_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processed_at?: string;
  created_at: string;
}

// Hook to get commissions for current user
export function useCommissions(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
}) {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['commissions', user?.id, filters],
    async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('commission_records')
        .select(`
          *,
          operations (
            id,
            reference_number,
            amount,
            operation_types (name)
          ),
          agent:profiles!commission_records_agent_id_fkey (id, name),
          chef_agence:profiles!commission_records_chef_agence_id_fkey (id, name)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'agent') {
        query = query.eq('agent_id', user.id);
      } else if (user.role === 'chef_agence') {
        query = query.or(`chef_agence_id.eq.${user.id},agent_id.in.(select id from profiles where agency_id=${user.agenceId})`);
      }
      
      // Apply additional filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Commission[];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to get commission summary for current user
export function useCommissionSummary() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['commission-summary', user?.id],
    async () => {
      if (!user?.id) return null;
      
      // Get commission totals based on user role
      let query = supabase
        .from('commission_records')
        .select('agent_commission, chef_commission, status');
      
      if (user.role === 'agent') {
        query = query.eq('agent_id', user.id);
      } else if (user.role === 'chef_agence') {
        query = query.or(`chef_agence_id.eq.${user.id},agent_id.in.(select id from profiles where agency_id=${user.agenceId})`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate totals
      const summary = data?.reduce((acc, commission) => {
        const userCommission = user.role === 'agent' 
          ? commission.agent_commission 
          : commission.chef_commission;
        
        if (commission.status === 'earned' || commission.status === 'pending_transfer') {
          acc.pending += userCommission;
        } else if (commission.status === 'paid') {
          acc.paid += userCommission;
        }
        
        acc.total += userCommission;
        
        return acc;
      }, {
        total: 0,
        paid: 0,
        pending: 0,
      }) || { total: 0, paid: 0, pending: 0 };
      
      return summary;
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to transfer commission (agent or chef can transfer their own)
export function useTransferCommission() {
  const { user } = useAuth();
  
  return useSupabaseMutation<any, {
    commission_record_id: string;
    transfer_type: 'agent_payment' | 'chef_payment';
  }>(
    async ({ commission_record_id, transfer_type }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process_commission_transfer_atomic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          commission_record_id,
          transfer_type,
          recipient_id: user?.id,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du transfert de commission');
      }
      
      return result;
    },
    {
      invalidateQueries: [['commissions'], ['commission-summary'], ['profile']],
      successMessage: 'Commission transférée avec succès',
      errorMessage: 'Erreur lors du transfert de commission',
    }
  );
}

// Hook to get commission transfers
export function useCommissionTransfers() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['commission-transfers', user?.id],
    async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('commission_transfers')
        .select(`
          *,
          commission_records (
            operations (reference_number, operation_types (name))
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CommissionTransfer[];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to get agency commission summary (for chef_agence)
export function useAgencyCommissionSummary() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['agency-commission-summary', user?.agenceId],
    async () => {
      if (user?.role !== 'chef_agence' || !user?.agenceId) return null;
      
      // Get all commissions for agency agents
      const { data, error } = await supabase
        .from('commission_records')
        .select(`
          agent_commission,
          chef_commission,
          status,
          agent_id,
          chef_agence_id
        `)
        .or(`chef_agence_id.eq.${user.id},agent_id.in.(select id from profiles where agency_id=${user.agenceId})`);
      
      if (error) throw error;
      
      // Calculate agency-wide commission summary
      const summary = data?.reduce((acc, commission) => {
        // Chef's own commissions
        if (commission.chef_agence_id === user.id) {
          acc.chef_total += commission.chef_commission;
          if (commission.status === 'paid') {
            acc.chef_paid += commission.chef_commission;
          } else {
            acc.chef_pending += commission.chef_commission;
          }
        }
        
        // Agency agents' commissions
        acc.agency_total += commission.agent_commission;
        if (commission.status === 'paid') {
          acc.agency_paid += commission.agent_commission;
        } else {
          acc.agency_pending += commission.agent_commission;
        }
        
        return acc;
      }, {
        chef_total: 0,
        chef_paid: 0,
        chef_pending: 0,
        agency_total: 0,
        agency_paid: 0,
        agency_pending: 0,
      }) || {
        chef_total: 0,
        chef_paid: 0,
        chef_pending: 0,
        agency_total: 0,
        agency_paid: 0,
        agency_pending: 0,
      };
      
      return summary;
    },
    {
      enabled: user?.role === 'chef_agence' && !!user?.agenceId,
    }
  );
}