import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Dashboard data types
export interface DashboardData {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_balance: number;
  pending_operations: number;
  pending_urgent: number;
  completed_today: number;
  support_tickets: number;
  avg_processing_time: string;
  my_assignments: any[];
}

export interface ValidationQueueStats {
  total_pending: number;
  total_urgent: number;
  average_age: string;
  oldest_operation: string;
}

// Hook to get dashboard data
export function useDashboardData() {
  return useSupabaseQuery(
    ['dashboard-data'],
    async () => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return data;
    }
  );
}

// Hook to get dashboard data for sous-admin
export function useSousAdminDashboard() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['sous-admin-dashboard', user?.id],
    async () => {
      const { data, error } = await supabase.rpc('get_sous_admin_dashboard', {
        user_id: user?.id,
      });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user?.id,
    }
  );
}

// Hook to get validation queue statistics
export function useValidationQueueStats() {
  return useSupabaseQuery(
    ['validation-queue-stats'],
    async () => {
      const { data, error } = await supabase
        .from('validation_queue_stats')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return data;
    }
  );
}

// Hook to get operations by queue
export function useOperationsByQueue() {
  return useSupabaseQuery(
    ['operations-by-queue'],
    async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (name, description),
          profiles!operations_initiator_id_fkey (name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  );
}

// Hook to validate an operation
export function useValidateOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (operationId: string) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status: 'validated',
          validator_id: user?.id,
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['operations-by-queue']);
        queryClient.invalidateQueries(['validation-queue-stats']);
      },
    }
  );
}

// Hook to reject an operation
export function useRejectOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async ({ operationId, reason }: { operationId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status: 'rejected',
          validator_id: user?.id,
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['operations-by-queue']);
        queryClient.invalidateQueries(['validation-queue-stats']);
      },
    }
  );
}

export function useReleaseOperation() {
  return useSupabaseMutation<any, { operationId: string; validatorId: string }>(
    async ({ operationId, validatorId }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          validator_id: null,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .eq('validator_id', validatorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['operations-by-queue'], ['validation-queue-stats']],
      successMessage: 'Opération libérée',
      errorMessage: 'Erreur lors de la libération',
    }
  );
}
