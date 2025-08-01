
import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  requester_id: string;
  assigned_to_id?: string;
  ticket_type: string;
  title: string;
  ticket_number: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'pending_user' | 'resolved' | 'closed';
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  profiles?: {
    id: string;
    name: string;
    email: string;
    role_id?: number;
  };
  assigned_profiles?: {
    id: string;
    name: string;
    email: string;
  };
}

// Hook to get all support tickets (for admins)
export function useSupportTickets() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['support-tickets', user?.role],
    async () => {
      const { data, error } = await supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, role_id),
          assigned_profiles:profiles!request_tickets_assigned_to_id_fkey (id, name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: user?.role && ['admin_general', 'sous_admin'].includes(user.role),
    }
  );
}

// Hook to get tickets assigned to current user
export function useMyTickets() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['my-tickets', user?.id],
    async () => {
      const { data, error } = await supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, role_id)
        `)
        .eq('assigned_to_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to create a support ticket
export function useCreateSupportTicket() {
  return useSupabaseMutation<any, {
    title: string;
    description?: string;
    ticket_type: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    requester_id: string;
  }>(
    async (ticketData) => {
      // Generate a unique ticket number
      const timestamp = Date.now();
      const ticketNumber = `SUP-${timestamp}`;
      
      const { data, error } = await supabase
        .from('request_tickets')
        .insert({
          requester_id: ticketData.requester_id,
          ticket_type: ticketData.ticket_type,
          title: ticketData.title,
          ticket_number: ticketNumber,
          description: ticketData.description || '',
          priority: ticketData.priority,
          status: 'open',
        })
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, role_id)
        `)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    {
      invalidateQueries: [['support-tickets']],
      successMessage: 'Ticket créé avec succès',
      errorMessage: 'Erreur lors de la création du ticket',
    }
  );
}

// Hook to assign a ticket
export function useAssignTicket() {
  return useSupabaseMutation<any, {
    ticketId: string;
    assigneeId: string;
  }>(
    async ({ ticketId, assigneeId }) => {
      const { data, error } = await supabase
        .from('request_tickets')
        .update({
          assigned_to_id: assigneeId,
          status: 'assigned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, role_id),
          assigned_profiles:profiles!request_tickets_assigned_to_id_fkey (id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    {
      invalidateQueries: [['support-tickets'], ['my-tickets']],
      successMessage: 'Ticket assigné',
      errorMessage: 'Erreur lors de l\'assignation',
    }
  );
}

// Hook to resolve a ticket
export function useResolveTicket() {
  return useSupabaseMutation<any, {
    ticketId: string;
    response: string;
    status: 'resolved' | 'in_progress' | 'pending_user';
  }>(
    async ({ ticketId, response, status }) => {
      const updateData: any = {
        resolution_notes: response,
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('request_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (id, name, email, role_id),
          assigned_profiles:profiles!request_tickets_assigned_to_id_fkey (id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    {
      invalidateQueries: [['support-tickets'], ['my-tickets']],
      successMessage: 'Ticket mis à jour',
      errorMessage: 'Erreur lors de la mise à jour',
    }
  );
}

// Hook to escalate a ticket (for sous-admin to admin)
export function useEscalateTicket() {
  return useSupabaseMutation<any, {
    ticketId: string;
    notes: string;
  }>(
    async ({ ticketId, notes }) => {
      const { data, error } = await supabase
        .from('request_tickets')
        .update({
          assigned_to_id: null, // Remove current assignment
          status: 'open',
          priority: 'high', // Escalate priority
          description: `${notes}\n\n--- ESCALATION ---\nTicket escaladé par un sous-administrateur.`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) throw error;
      return data as any;
    },
    {
      invalidateQueries: [['support-tickets'], ['my-tickets']],
      successMessage: 'Ticket escaladé vers l\'administrateur général',
      errorMessage: 'Erreur lors de l\'escalade',
    }
  );
}
