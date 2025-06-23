import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RechargeRequest {
  id: string;
  title: string;
  description: string;
  ticket_number: string;
  ticket_type: string;
  status: string;
  priority: string;
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
}

export const useRechargeRequests = (filter?: { status?: string; requester_id?: string }) => {
  const { user } = useAuth();

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
          )
        `)
        .eq('ticket_type', 'recharge')
        .order('created_at', { ascending: false });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.requester_id) {
        query = query.eq('requester_id', filter.requester_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recharge requests:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(request => ({
        ...request,
        profiles: request.profiles && typeof request.profiles === 'object' && 'name' in request.profiles 
          ? request.profiles 
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

  return useMutation({
    mutationFn: async (requestData: {
      title: string;
      description: string;
      requested_amount: number;
      priority?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const ticketNumber = `RCH-${Date.now()}`;

      const { data, error } = await supabase
        .from('request_tickets')
        .insert({
          ticket_number: ticketNumber,
          ticket_type: 'recharge',
          title: requestData.title,
          description: requestData.description,
          requested_amount: requestData.requested_amount,
          priority: requestData.priority || 'medium',
          status: 'open',
          requester_id: user.id,
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
};

export const useUpdateRechargeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<RechargeRequest> 
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
};
