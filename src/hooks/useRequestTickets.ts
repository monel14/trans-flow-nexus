
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RequestTicket {
  id: string;
  ticket_number: string;
  requester_id: string;
  assigned_to_id?: string;
  ticket_type: 'recharge' | 'support' | 'technical' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  title: string;
  description: string;
  requested_amount?: number;
  resolution_notes?: string;
  resolved_by_id?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useRequestTickets = (filters?: {
  status?: string;
  ticket_type?: string;
  requester_id?: string;
  assigned_to_id?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['request-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey(name, email),
          assigned_to:profiles!request_tickets_assigned_to_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.ticket_type) {
        query = query.eq('ticket_type', filters.ticket_type);
      }
      if (filters?.requester_id) {
        query = query.eq('requester_id', filters.requester_id);
      }
      if (filters?.assigned_to_id) {
        query = query.eq('assigned_to_id', filters.assigned_to_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RequestTicket[];
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: Omit<RequestTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>) => {
      // Générer un numéro de ticket unique
      const ticket_number = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('request_tickets')
        .insert([{ ...ticketData, ticket_number }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-tickets'] });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RequestTicket> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['request-tickets'] });
    },
  });

  return {
    tickets: tickets || [],
    isLoading,
    createTicket: createTicketMutation.mutate,
    updateTicket: updateTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    isUpdating: updateTicketMutation.isPending,
  };
};
