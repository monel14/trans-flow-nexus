
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
          profiles!request_tickets_requester_id_fkey (
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
        profiles: request.profiles && 
          typeof request.profiles === 'object' && 
          !Array.isArray(request.profiles) &&
          request.profiles !== null &&
          'name' in request.profiles &&
          'email' in request.profiles
          ? {
              name: request.profiles.name as string,
              email: request.profiles.email as string
            }
          : null,
        assigned_to: request.assigned_to && 
          typeof request.assigned_to === 'object' && 
          !Array.isArray(request.assigned_to) &&
          request.assigned_to !== null &&
          'name' in request.assigned_to &&
          'email' in request.assigned_to
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
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (rechargeData: {
      title: string;
      description: string;
      priority?: string;
      requested_amount?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const ticketNumber = `RCH-${Date.now()}`;

      const { data, error } = await supabase
        .from('request_tickets')
        .insert({
          ticket_number: ticketNumber,
          ticket_type: 'recharge',
          title: rechargeData.title,
          description: rechargeData.description,
          priority: rechargeData.priority || 'medium',
          status: 'open',
          requester_id: user.id,
          requested_amount: rechargeData.requested_amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recharge-requests'] });
    },
  });

  return {
    createRechargeRequest: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useUpdateRechargeRequest = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RechargeRequest>;
    }) => {
      const { data, error } = await supabase
        .from('request_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recharge-requests'] });
    },
  });

  return {
    updateRechargeRequest: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
