import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
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
  assigned_to?: {
    name: string;
    email: string;
  } | null;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
  } | null;
}

export const useSupportTickets = (filter?: { status?: string; requester_id?: string; ticket_type?: string }) => {
  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['support-tickets', filter],
    queryFn: async (): Promise<SupportTicket[]> => {
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
        .order('created_at', { ascending: false });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.requester_id) {
        query = query.eq('requester_id', filter.requester_id);
      }

      if (filter?.ticket_type) {
        query = query.eq('ticket_type', filter.ticket_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(ticket => ({
        ...ticket,
        profiles: ticket.profiles && 
          typeof ticket.profiles === 'object' && 
          !Array.isArray(ticket.profiles)
          ? {
              name: (ticket.profiles as any).name as string,
              email: (ticket.profiles as any).email as string
            }
          : null,
        assigned_to: ticket.assigned_to && 
          typeof ticket.assigned_to === 'object' && 
          !Array.isArray(ticket.assigned_to)
          ? {
              name: (ticket.assigned_to as any).name as string,
              email: (ticket.assigned_to as any).email as string
            }
          : null
      }));

      return transformedData;
    },
  });

  return {
    tickets,
    isLoading,
    error,
    refetch
  };
};

export const useTicketComments = (ticketId: string) => {
  const { data: comments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async (): Promise<TicketComment[]> => {
      const { data, error } = await supabase
        .from('request_ticket_comments')
        .select(`
          *,
          profiles!request_ticket_comments_author_id_fkey (
            name,
            email
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ticket comments:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(comment => ({
        ...comment,
        profiles: comment.profiles && 
          typeof comment.profiles === 'object' && 
          !Array.isArray(comment.profiles)
          ? {
              name: (comment.profiles as any).name as string,
              email: (comment.profiles as any).email as string
            }
          : null
      }));

      return transformedData;
    },
    enabled: !!ticketId,
  });

  return {
    comments,
    isLoading,
    error,
    refetch
  };
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ticketData: {
      title: string;
      description: string;
      priority?: string;
      ticket_type?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const ticketNumber = `SUP-${Date.now()}`;

      const { data, error } = await supabase
        .from('request_tickets')
        .insert({
          ticket_number: ticketNumber,
          ticket_type: ticketData.ticket_type || 'support',
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority || 'medium',
          status: 'open',
          requester_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<SupportTicket> 
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
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};

export const useAddTicketComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ticketId,
      commentText,
      isInternal = false,
    }: {
      ticketId: string;
      commentText: string;
      isInternal?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_ticket_comments')
        .insert({
          ticket_id: ticketId,
          author_id: user.id,
          comment_text: commentText,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    },
  });
};

// Add the missing export that SupportRequests.tsx expects
export const useCreateSupportTicket = useCreateTicket;
