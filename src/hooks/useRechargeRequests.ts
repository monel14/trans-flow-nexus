import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RechargeRequest {
  id: string;
  requester_id: string;
  assigned_to_id?: string;
  ticket_type: string;
  subject: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  requested_amount?: number;
  approved_amount?: number;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  profiles?: {
    id: string;
    name: string;
    email: string;
    balance?: number;
  };
  assigned_profiles?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateRechargeRequestData {
  amount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  description?: string;
  requester_id: string;
  assigned_to_id?: string;
  ticket_type: string;
}

// Hook to get recharge requests for current user
export function useRechargeRequests(userId?: string) {
  return useSupabaseQuery(
    ['recharge-requests', userId],
    async () => {
      const { data, error } = await supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, balance),
          assigned_profiles:profiles!request_tickets_assigned_to_id_fkey (id, name, email)
        `)
        .eq('requester_id', userId)
        .eq('ticket_type', 'recharge_request')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RechargeRequest[];
    },
    {
      enabled: !!userId,
    }
  );
}

// Hook to get agent recharge requests for Chef d'agence
export function useAgentRechargeRequests(agencyId?: string) {
  return useSupabaseQuery(
    ['agent-recharge-requests', agencyId],
    async () => {
      const { data, error } = await supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, balance, agency_id),
          assigned_profiles:profiles!request_tickets_assigned_to_id_fkey (id, name, email)
        `)
        .eq('ticket_type', 'recharge_request')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter by agency (since we can't do complex joins directly)
      const filteredData = data?.filter(request => 
        request.profiles?.agency_id === parseInt(agencyId || '0')
      ) || [];
      
      return filteredData as RechargeRequest[];
    },
    {
      enabled: !!agencyId,
    }
  );
}

// Hook to create a new recharge request
export function useCreateRechargeRequest() {
  return useSupabaseMutation<RechargeRequest, CreateRechargeRequestData>(
    async (requestData) => {
      const { data, error } = await supabase
        .from('request_tickets')
        .insert({
          requester_id: requestData.requester_id,
          assigned_to_id: requestData.assigned_to_id,
          ticket_type: requestData.ticket_type,
          subject: `Demande de recharge - ${requestData.amount.toLocaleString()} FCFA`,
          description: requestData.description,
          priority: requestData.priority,
          status: 'pending',
          requested_amount: requestData.amount,
        })
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, balance)
        `)
        .single();
      
      if (error) throw error;
      return data as RechargeRequest;
    },
    {
      invalidateQueries: [['recharge-requests'], ['agent-recharge-requests']],
      successMessage: 'Demande de recharge envoyée',
      errorMessage: 'Erreur lors de l\'envoi de la demande',
    }
  );
}

// Hook to process a recharge request (approve/reject)
export function useProcessRecharge() {
  return useSupabaseMutation<any, {
    requestId: string;
    action: 'approve' | 'reject';
    notes?: string;
    amount?: number;
  }>(
    async ({ requestId, action, notes, amount }) => {
      if (action === 'approve' && amount) {
        // Use the atomic function for approval with fund transfer
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process_recharge_atomic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            request_id: requestId,
            approved_amount: amount,
            notes,
          }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de l\'approbation');
        }
        
        return result;
      } else {
        // Simple rejection
        const { data, error } = await supabase
          .from('request_tickets')
          .update({
            status: 'rejected',
            resolution_notes: notes,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', requestId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    {
      invalidateQueries: [['recharge-requests'], ['agent-recharge-requests'], ['transaction-ledger']],
      successMessage: 'Demande traitée avec succès',
      errorMessage: 'Erreur lors du traitement',
    }
  );
}