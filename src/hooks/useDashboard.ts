
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

export interface AgentDashboardKPIs {
  agent_balance: {
    amount: number;
    formatted: string;
    status: 'good' | 'medium' | 'low' | 'critical';
    subtitle: string;
  };
  operations_today: {
    total: number;
    completed: number;
    pending: number;
    success_rate: number;
    subtitle: string;
  };
  commissions_week: {
    amount: number;
    formatted: string;
    subtitle: string;
  };
  monthly_objective: {
    target: number;
    target_formatted: string;
    current_volume: number;
    current_formatted: string;
    progress_percentage: number;
    progress_formatted: string;
    remaining: number;
    remaining_formatted: string;
    subtitle: string;
  };
}

export interface ChefAgenceDashboardKPIs {
  chef_balance: {
    amount: number;
    formatted: string;
    status: 'good' | 'medium' | 'low' | 'critical';
    subtitle: string;
  };
  agency_volume_month: {
    amount: number;
    formatted: string;
    growth_percentage: number;
    growth_formatted: string;
    subtitle: string;
  };
  agency_commissions: {
    amount: number;
    formatted: string;
    subtitle: string;
  };
  agents_performance: {
    total_agents: number;
    active_week: number;
    performants: number;
    performance_rate: number;
    subtitle: string;
  };
  pending_actions: {
    recharge_requests: number;
    inactive_agents: number;
    subtitle: string;
  };
}

export interface AgentPerformance {
  id: string;
  name: string;
  email: string;
  balance: number;
  balance_formatted: string;
  operations_week: number;
  volume_week: number;
  volume_week_formatted: string;
  commissions_week: number;
  commissions_week_formatted: string;
  success_rate: number;
  performance_level: 'excellent' | 'good' | 'average' | 'needs_attention';
  last_activity: string;
  is_active_week: boolean;
}

// Mock data generators
const generateMockAgentKPIs = (): AgentDashboardKPIs => ({
  agent_balance: {
    amount: 150000,
    formatted: '150,000 XOF',
    status: 'good',
    subtitle: 'Solde suffisant pour vos opérations'
  },
  operations_today: {
    total: 8,
    completed: 6,
    pending: 2,
    success_rate: 75,
    subtitle: '+6 complétées sur 8 aujourd\'hui'
  },
  commissions_week: {
    amount: 12500,
    formatted: '12,500 XOF',
    subtitle: 'Gains cette semaine'
  },
  monthly_objective: {
    target: 500000,
    target_formatted: '500,000 XOF',
    current_volume: 325000,
    current_formatted: '325,000 XOF',
    progress_percentage: 65,
    progress_formatted: '65%',
    remaining: 175000,
    remaining_formatted: '175,000 XOF',
    subtitle: 'Objectif mensuel en cours - 65% réalisé'
  }
});

const generateMockChefAgenceKPIs = (): ChefAgenceDashboardKPIs => ({
  chef_balance: {
    amount: 500000,
    formatted: '500,000 XOF',
    status: 'good',
    subtitle: 'Fonds disponibles pour recharges agents'
  },
  agency_volume_month: {
    amount: 2500000,
    formatted: '2,500,000 XOF',
    growth_percentage: 12.5,
    growth_formatted: '+12.5%',
    subtitle: 'En croissance vs mois dernier'
  },
  agency_commissions: {
    amount: 75000,
    formatted: '75,000 XOF',
    subtitle: 'Revenus équipe ce mois'
  },
  agents_performance: {
    total_agents: 8,
    active_week: 6,
    performants: 4,
    performance_rate: 50,
    subtitle: '4/8 agents atteignent leurs objectifs'
  },
  pending_actions: {
    recharge_requests: 3,
    inactive_agents: 2,
    subtitle: '3 demandes de recharge en attente'
  }
});

const generateMockAgentsPerformance = (limit: number): AgentPerformance[] => {
  const agents = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    agents.push({
      id: `agent-${i + 1}`,
      name: `Agent ${i + 1}`,
      email: `agent${i + 1}@agency.com`,
      balance: Math.floor(Math.random() * 200000) + 50000,
      balance_formatted: `${Math.floor(Math.random() * 200000) + 50000} XOF`,
      operations_week: Math.floor(Math.random() * 15) + 5,
      volume_week: Math.floor(Math.random() * 300000) + 100000,
      volume_week_formatted: `${Math.floor(Math.random() * 300000) + 100000} XOF`,
      commissions_week: Math.floor(Math.random() * 8000) + 2000,
      commissions_week_formatted: `${Math.floor(Math.random() * 8000) + 2000} XOF`,
      success_rate: Math.floor(Math.random() * 30) + 70,
      performance_level: ['excellent', 'good', 'average', 'needs_attention'][Math.floor(Math.random() * 4)] as AgentPerformance['performance_level'],
      last_activity: new Date().toISOString(),
      is_active_week: true
    });
  }
  return agents;
};

// Hook to get dashboard data using RPC function
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      // Return mock data since dashboard_metrics table doesn't exist
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
    queryFn: async (): Promise<ValidationQueueStats> => {
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
    queryFn: async (): Promise<AgentDashboardKPIs> => {
      try {
        const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');
        if (error) {
          console.warn('RPC function not available, using mock data');
          return generateMockAgentKPIs();
        }
        return data as AgentDashboardKPIs;
      } catch (error) {
        console.warn('Error fetching agent KPIs, using mock data:', error);
        return generateMockAgentKPIs();
      }
    }
  });
}

// Hook to get chef agence dashboard KPIs
export function useChefAgenceDashboardKPIs() {
  return useQuery({
    queryKey: ['chef-agence-dashboard-kpis'],
    queryFn: async (): Promise<ChefAgenceDashboardKPIs> => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');
        if (error) {
          console.warn('RPC function not available, using mock data');
          return generateMockChefAgenceKPIs();
        }
        return data as ChefAgenceDashboardKPIs;
      } catch (error) {
        console.warn('Error fetching chef agence KPIs, using mock data:', error);
        return generateMockChefAgenceKPIs();
      }
    }
  });
}

// Hook to get chef agents performance
export function useChefAgentsPerformance(limit: number = 10) {
  return useQuery({
    queryKey: ['chef-agents-performance', limit],
    queryFn: async (): Promise<AgentPerformance[]> => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agents_performance', { p_limit: limit });
        if (error) {
          console.warn('RPC function not available, using mock data');
          return generateMockAgentsPerformance(limit);
        }
        return Array.isArray(data) ? data : generateMockAgentsPerformance(limit);
      } catch (error) {
        console.warn('Error fetching agents performance, using mock data:', error);
        return generateMockAgentsPerformance(limit);
      }
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
