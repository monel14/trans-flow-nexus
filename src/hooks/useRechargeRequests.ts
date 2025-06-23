import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RechargeRequest {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  requested_amount: number | null;
  requester_id: string;
  assigned_to_id: string | null;
  resolved_by_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  profiles?: {
    name: string;
    email: string;
  } | null;
  assigned_to?: {
    name: string;
    email: string;
  } | null;
}

export const useRechargeRequests = (filter?: { requester_id?: string; status?: string }) => {
  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['recharge-requests', filter],
    queryFn: async (): Promise<RechargeRequest[]> => {
      let query = supabase
        .from('request_tickets')
        .select(`
          *,
          requester:profiles!request_tickets_requester_id_fkey (
            name,
            email
          ),
          assigned_to:profiles!request_tickets_assigned_to_id_fkey (
            name,
            email
          )
        `)
        .eq('ticket_type', 'recharge')
        .order('created_at', { ascending: false });

      if (filter?.requester_id) {
        query = query.eq('requester_id', filter.requester_id);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recharge requests:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(request => ({
        ...request,
        requester: (request.requester && 
          typeof request.requester === 'object' && 
          !Array.isArray(request.requester) &&
          'name' in request.requester &&
          'email' in request.requester &&
          request.requester.name !== null)
          ? {
              name: request.requester.name as string,
              email: request.requester.email as string
            }
          : null,
        assigned_to: (request.assigned_to && 
          typeof request.assigned_to === 'object' && 
          !Array.isArray(request.assigned_to) &&
          'name' in request.assigned_to &&
          'email' in request.assigned_to &&
          request.assigned_to.name !== null)
          ? {
              name: request.assigned_to.name as string,
              email: request.assigned_to.email as string
            }
          : null
      }));

      return transformedData;
    },
  });

  return {
    requests,
    isLoading,
    error,
    refetch
  };
};

export const useCreateRechargeRequest = () => {
  const queryClient = useQueryClient();
  const { mutate: createTicket, isLoading, error } = useCreateTicket();

  const handleCreateRechargeRequest = async (rechargeData: {
    title: string;
    description: string;
    priority?: string;
    requested_amount?: number;
  }) => {
    try {
      await createTicket({
        title: rechargeData.title,
        description: rechargeData.description,
        priority: rechargeData.priority || 'medium',
        ticket_type: 'recharge',
        requested_amount: rechargeData.requested_amount,
      });
      queryClient.invalidateQueries({ queryKey: ['recharge-requests'] });
    } catch (err) {
      console.error("Failed to create recharge request:", err);
      throw err;
    }
  };

  return {
    createRechargeRequest: handleCreateRechargeRequest,
    isLoading,
    error,
  };
};

export const useUpdateRechargeRequest = () => {
  const queryClient = useQueryClient();
  const { mutate: updateTicket, isLoading, error } = useUpdateTicket();

  const handleUpdateRechargeRequest = async ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<RechargeRequest>;
  }) => {
    try {
      await updateTicket({ id, updates });
      queryClient.invalidateQueries({ queryKey: ['recharge-requests'] });
    } catch (err) {
      console.error("Failed to update recharge request:", err);
      throw err;
    }
  };

  return {
    updateRechargeRequest: handleUpdateRechargeRequest,
    isLoading,
    error,
  };
};

import { useCreateTicket, useUpdateTicket } from './useSupportTickets';
