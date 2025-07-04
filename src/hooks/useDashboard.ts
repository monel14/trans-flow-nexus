import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types pour les KPIs
export interface AdminDashboardKPIs {
  volume_today: {
    amount: number;
    growth_percentage: number;
    subtitle: string;
    formatted?: string;
    growth_formatted?: string;
  };
  operations_system: {
    total_today: number;
    completed: number;
    pending: number;
    subtitle: string;
  };
  network_stats: {
    total_agencies: number;
    active_users: number;
    total_agents: number;
    subtitle: string;
    active_agencies?: number;
  };
  monthly_revenue: {
    amount: number;
    target: number;
    progress_percentage: number;
    subtitle: string;
    formatted?: string;
  };
  critical_alerts: {
    low_balance_agents: number;
    pending_validations: number;
    urgent_tickets: number;
    subtitle: string;
    blocked_transactions?: number;
    support_requests?: number;
    underperforming_agencies?: number;
  };
}

export interface SousAdminDashboardKPIs {
  pending_urgent: {
    count: number;
    subtitle: string;
  };
  completed_today: {
    count: number;
    subtitle: string;
  };
  support_tickets: {
    open: number;
    in_progress: number;
    subtitle: string;
  };
  avg_processing_time: {
    hours: number;
    subtitle: string;
  };
  my_assignments: {
    count: number;
    subtitle: string;
  };
}

export interface ChefAgenceDashboardKPIs {
  chef_balance: {
    amount: number;
    formatted: string;
    status: string;
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
  agency_id: number;
}

export interface AgentDashboardKPIs {
  agent_balance: {
    amount: number;
    formatted: string;
    status: string;
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
  performance_summary: {
    volume_month: number;
    commissions_month: number;
    operations_avg_day: number;
  };
}

export interface AgencyPerformance {
  id: number;
  name: string;
  city: string;
  volume_today: number;
  volume_month?: number;
  operations_count: number;
  agents_count: number;
  performance_score: number;
}

export interface ValidationQueueStats {
  unassigned_count: number;
  my_tasks_count: number;
  all_tasks_count: number;
  urgent_count: number;
  avg_wait_time_hours: number;
  oldest_pending_hours: number;
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
  performance_level: string;
  last_activity: string;
  is_active_week: boolean;
}

// Hook pour les KPIs de l'admin général
export const useAdminDashboardKPIs = () => {
  return useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_kpis' as any);
      if (error) throw error;
      return data as unknown as AdminDashboardKPIs;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Hook pour les KPIs du sous-admin
export const useSousAdminDashboardKPIs = () => {
  return useQuery({
    queryKey: ['sous-admin-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sous_admin_dashboard_kpis' as any);
      if (error) throw error;
      return data as unknown as SousAdminDashboardKPIs;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Hook pour les performances des agences
export const useTopAgenciesPerformance = (limit: number = 5) => {
  return useQuery({
    queryKey: ['top-agencies-performance', limit.toString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_agencies_performance' as any, {
        p_limit: limit
      });
      if (error) throw error;
      return (data as unknown as AgencyPerformance[]) || [];
    },
    staleTime: 5 * 60 * 1000
  });
};

// Hook pour les statistiques de la file de validation
export const useValidationQueueStats = () => {
  return useQuery({
    queryKey: ['validation-queue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_validation_queue_stats' as any);
      if (error) throw error;
      return data as unknown as ValidationQueueStats;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};

// Hook pour assigner une opération à un validateur
export const useAssignOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      operationId,
      validatorId,
    }: {
      operationId: string;
      validatorId: string;
    }) => {
      const { data, error } = await supabase.rpc('assign_operation_to_user' as any, {
        p_operation_id: operationId,
        p_validator_id: validatorId
      });
      if (error) throw error;
      
      const result = data as { success: boolean; message?: string; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'assignation');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-queue-stats'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast({
        title: "Assignation réussie",
        description: "L'opération a été assignée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'assignation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook pour récupérer les opérations en attente de validation
export const usePendingValidations = () => {
  return useQuery({
    queryKey: ['pending-validations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (name, description),
          profiles!operations_initiator_id_fkey (name, email),
          agencies (name, city)
        `)
        .eq('status', 'pending_validation')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });
};

// Hook pour récupérer les tickets de support
export const useSupportTickets = (limit: number = 10) => {
  return useQuery({
    queryKey: ['support-tickets', limit.toString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('request_tickets')
        .select(`
          *,
          profiles!request_tickets_requester_id_fkey (name, email),
          profiles!request_tickets_assigned_to_id_fkey (name, email)
        `)
        .in('status', ['open', 'in_progress', 'pending'])
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },  
    staleTime: 60 * 1000
  });
};

// Hook pour récupérer les transactions récentes
export const useRecentTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-transactions', limit.toString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (name, description),
          profiles (name, email),
          agencies (name, city)
        `)
        .in('status', ['completed', 'pending_validation', 'pending'])
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000
  });
};

// Hook pour les KPIs de chef d'agence
export const useChefAgenceDashboardKPIs = () => {
  return useQuery({
    queryKey: ['chef-agence-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');
      if (error) throw error;
      return data as unknown as ChefAgenceDashboardKPIs;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

// Hook pour les KPIs d'agent
export const useAgentDashboardKPIs = () => {
  return useQuery({
    queryKey: ['agent-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');
      if (error) throw error;
      return data as unknown as AgentDashboardKPIs;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

// Hook pour les performances des agents (pour chef d'agence)
export const useChefAgentsPerformance = (limit: number = 10) => {
  return useQuery({
    queryKey: ['chef-agents-performance', limit.toString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chef_agents_performance', {
        p_limit: limit
      });
      if (error) throw error;
      return (data as unknown as AgentPerformance[]) || [];
    },
    staleTime: 5 * 60 * 1000
  });
};

// Hook pour les notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000
  });
};
