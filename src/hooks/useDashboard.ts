
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
  unassigned_count: number;
  my_tasks_count: number;
  all_tasks_count: number;
  completed_today: number;
}

// Hook to get dashboard data using RPC function
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Since dashboard_metrics table doesn't exist, return mock data
      return {
        total_users: 150,
        active_users: 120,
        new_users_today: 5,
        total_balance: 2500000,
        pending_operations: 12,
        pending_urgent: 3,
        completed_today: 45,
        support_tickets: 8,
        avg_processing_time: '2.5',
        my_assignments: []
      };
    }
  });
}

// Hook to get dashboard data for sous-admin
export function useSousAdminDashboard() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sous-admin-dashboard', user?.id],
    queryFn: async () => {
      // Return mock data since RPC function doesn't exist
      return {
        pending_urgent: 2,
        completed_today: 15,
        support_tickets: 5,
        avg_processing_time: '1.8',
        my_assignments: [
          {
            id: '1',
            title: 'Validation urgente',
            priority: 'urgent',
            assigned_by: { name: 'Admin Principal' }
          }
        ]
      };
    },
    enabled: !!user?.id,
  });
}

// Hook to get validation queue statistics
export function useValidationQueueStats() {
  return useQuery({
    queryKey: ['validation-queue-stats'],
    queryFn: async () => {
      // Return mock data since validation_queue_stats table doesn't exist
      return {
        total_pending: 15,
        total_urgent: 3,
        average_age: '2.5 hours',
        oldest_operation: '6 hours',
        unassigned_count: 8,
        my_tasks_count: 4,
        all_tasks_count: 15,
        completed_today: 25
      };
    }
  });
}

// Hook to get operations by queue
export function useOperationsByQueue(queueType?: string) {
  return useQuery({
    queryKey: ['operations-by-queue', queueType],
    queryFn: async () => {
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
  });
}

// Hook to validate an operation using TanStack Query
export function useValidateOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ operation_id, action, notes }: { operation_id: string; action: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status: action === 'approve' ? 'completed' : 'rejected',
          validator_id: user?.id,
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          error_message: action === 'reject' ? notes : null
        })
        .eq('id', operation_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-queue'] });
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
    },
  });
}

// Hook to reject an operation using TanStack Query
export function useRejectOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ operationId, reason }: { operationId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status: 'rejected',
          validator_id: user?.id,
          error_message: reason,
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-queue'] });
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
    },
  });
}

// Hook to assign operation
export function useAssignOperation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ operation_id }: { operation_id: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          validator_id: user?.id,
          status: 'pending_validation',
          updated_at: new Date().toISOString(),
        })
        .eq('id', operation_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-queue'] });
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
    },
  });
}

// Hook to release operation
export function useReleaseOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ operation_id }: { operation_id: string }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          validator_id: null,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', operation_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-by-queue'] });
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
    },
  });
}

// Hook to get agent dashboard KPIs
export function useAgentDashboardKPIs() {
  return useQuery({
    queryKey: ['agent-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');
      if (error) throw error;
      return data;
    }
  });
}

// Hook to get chef agence dashboard KPIs
export function useChefAgenceDashboardKPIs() {
  return useQuery({
    queryKey: ['chef-agence-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');
      if (error) throw error;
      return data;
    }
  });
}

// Hook to get chef agents performance
export function useChefAgentsPerformance(limit: number = 10) {
  return useQuery({
    queryKey: ['chef-agents-performance', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chef_agents_performance', { p_limit: limit });
      if (error) throw error;
      return data;
    }
  });
}

// Hook to get admin dashboard KPIs
export function useAdminDashboardKPIs() {
  return useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async () => {
      // Return mock data since we don't have the RPC function
      return {
        volume_today: {
          amount: 5500000,
          formatted: '5,500,000 XOF',
          growth_percentage: 12.5
        },
        operations_system: {
          total_today: 156,
          subtitle: '156 opérations traitées aujourd\'hui'
        },
        network_stats: {
          total_agencies: 25,
          subtitle: '25 agences actives dans le réseau'
        },
        monthly_revenue: {
          amount: 125000000,
          formatted: '125,000,000 XOF',
          subtitle: 'Revenus système ce mois'
        },
        critical_alerts: {
          pending_validations: 8,
          urgent_tickets: 3,
          low_balance_agents: 12
        }
      };
    }
  });
}

// Hook to get top agencies performance
export function useTopAgenciesPerformance(limit: number = 5) {
  return useQuery({
    queryKey: ['top-agencies-performance', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, city')
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      
      // Add mock performance data
      return data?.map((agency, index) => ({
        ...agency,
        volume_today: Math.floor(Math.random() * 1000000) + 500000,
        operations_count: Math.floor(Math.random() * 50) + 10
      })) || [];
    }
  });
}
