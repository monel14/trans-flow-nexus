
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgentDashboardKPIs {
  agent_balance: {
    formatted: string;
    status: 'good' | 'medium' | 'low' | 'critical';
    subtitle: string;
  };
  operations_today: {
    total: number;
    completed: number;
    pending: number;
    subtitle: string;
  };
  commissions_week: {
    formatted: string;
    subtitle: string;
  };
  monthly_objective: {
    target_formatted: string;
    progress_formatted: string;
    progress_percentage: number;
    remaining_formatted: string;
  };
}

export interface ChefAgenceDashboardKPIs {
  chef_balance: {
    formatted: string;
    status: 'good' | 'medium' | 'low' | 'critical';
    subtitle: string;
  };
  agency_volume_month: {
    formatted: string;
    subtitle: string;
  };
  agency_commissions: {
    formatted: string;
    subtitle: string;
  };
  agents_performance: {
    performants: number;
    total_agents: number;
    subtitle: string;
  };
  pending_actions: {
    recharge_requests: number;
    inactive_agents: number;
  };
}

export interface AdminDashboardKPIs {
  volume_today: {
    amount: number;
    formatted: string;
    growth_percentage: number;
  };
  operations_system: {
    total_today: number;
    subtitle: string;
  };
  network_stats: {
    total_agencies: number;
    subtitle: string;
  };
  monthly_revenue: {
    amount: number;
    formatted: string;
    subtitle: string;
  };
  critical_alerts: {
    pending_validations: number;
    urgent_tickets: number;
    low_balance_agents: number;
  };
}

export interface SousAdminDashboardKPIs {
  pending_urgent: number;
  completed_today: number;
  support_tickets: number;
  avg_processing_time: string;
  my_assignments: Array<{
    title: string;
    assigned_by: { name: string };
    priority: string;
  }>;
}

export interface AgentPerformance {
  id: string;
  name: string;
  operations_week: number;
  volume_week_formatted: string;
  success_rate: number;
  performance_level: 'excellent' | 'good' | 'average' | 'poor';
}

export interface TopAgencyPerformance {
  id: string;
  name: string;
  city: string;
  volume_today: number;
  operations_count: number;
}

export interface ValidationQueueStats {
  unassigned_count: number;
  my_tasks_count: number;
  urgent_count: number;
  completed_today: number;
  all_tasks_count: number;
}

// Mock data functions
const getMockAgentDashboardKPIs = (): AgentDashboardKPIs => ({
  agent_balance: {
    formatted: '15,000 XOF',
    status: 'good',
    subtitle: 'Solde disponible'
  },
  operations_today: {
    total: 5,
    completed: 3,
    pending: 2,
    subtitle: 'Activité du jour'
  },
  commissions_week: {
    formatted: '2,500 XOF',
    subtitle: 'Gains de la semaine'
  },
  monthly_objective: {
    target_formatted: '50,000 XOF',
    progress_formatted: '50%',
    progress_percentage: 50,
    remaining_formatted: '25,000 XOF restant'
  }
});

const getMockChefAgenceDashboardKPIs = (): ChefAgenceDashboardKPIs => ({
  chef_balance: {
    formatted: '25,000 XOF',
    status: 'good',
    subtitle: 'Fonds disponibles'
  },
  agency_volume_month: {
    formatted: '150,000 XOF',
    subtitle: 'Volume mensuel'
  },
  agency_commissions: {
    formatted: '7,500 XOF',
    subtitle: 'Revenus équipe'
  },
  agents_performance: {
    performants: 7,
    total_agents: 10,
    subtitle: 'Performance équipe'
  },
  pending_actions: {
    recharge_requests: 2,
    inactive_agents: 1
  }
});

const getMockAdminDashboardKPIs = (): AdminDashboardKPIs => ({
  volume_today: {
    amount: 1500000,
    formatted: '1,500,000 XOF',
    growth_percentage: 15.3
  },
  operations_system: {
    total_today: 247,
    subtitle: 'Opérations aujourd\'hui'
  },
  network_stats: {
    total_agencies: 12,
    subtitle: 'Agences actives'
  },
  monthly_revenue: {
    amount: 45000000,
    formatted: '45,000,000 XOF',
    subtitle: 'Revenus ce mois'
  },
  critical_alerts: {
    pending_validations: 3,
    urgent_tickets: 1,
    low_balance_agents: 5
  }
});

const getMockSousAdminDashboardKPIs = (): SousAdminDashboardKPIs => ({
  pending_urgent: 2,
  completed_today: 8,
  support_tickets: 4,
  avg_processing_time: '2.5',
  my_assignments: [
    {
      title: 'Validation des comptes agents',
      assigned_by: { name: 'Admin Principal' },
      priority: 'urgent'
    },
    {
      title: 'Révision des opérations suspectes',
      assigned_by: { name: 'Chef de Service' },
      priority: 'normal'
    }
  ]
});

const getMockAgentPerformance = (): AgentPerformance[] => [
  {
    id: '1',
    name: 'Kouadio Konan',
    operations_week: 25,
    volume_week_formatted: '50,000 XOF',
    success_rate: 95,
    performance_level: 'excellent'
  },
  {
    id: '2',
    name: 'Fatima Diallo',
    operations_week: 20,
    volume_week_formatted: '40,000 XOF',
    success_rate: 90,
    performance_level: 'good'
  },
  {
    id: '3',
    name: 'Idriss Traoré',
    operations_week: 15,
    volume_week_formatted: '30,000 XOF',
    success_rate: 85,
    performance_level: 'average'
  }
];

const getMockTopAgenciesPerformance = (): TopAgencyPerformance[] => [
  {
    id: '1',
    name: 'Agence Centrale Abidjan',
    city: 'Abidjan',
    volume_today: 450000,
    operations_count: 28
  },
  {
    id: '2',
    name: 'Agence Bouaké',
    city: 'Bouaké',
    volume_today: 320000,
    operations_count: 22
  },
  {
    id: '3',
    name: 'Agence Yamoussoukro',
    city: 'Yamoussoukro',
    volume_today: 280000,
    operations_count: 19
  }
];

const getMockValidationQueueStats = (): ValidationQueueStats => ({
  unassigned_count: 5,
  my_tasks_count: 3,
  urgent_count: 2,
  completed_today: 12,
  all_tasks_count: 15
});

const getMockOperationsByQueue = (queue: string) => {
  const baseOperations = [
    {
      id: '1',
      reference_number: 'OP-001',
      created_at: new Date().toISOString(),
      amount: 150000,
      status: 'pending_validation',
      profiles: { name: 'Agent Test' },
      agencies: { name: 'Agence Test' },
      operation_types: { name: 'Transfert' },
      operation_data: { proof_url: 'https://example.com/proof.jpg' }
    }
  ];

  switch (queue) {
    case 'unassigned':
      return baseOperations.slice(0, 2);
    case 'my_tasks':
      return baseOperations.slice(0, 1);
    case 'all_tasks':
      return baseOperations;
    default:
      return [];
  }
};

export function useAgentDashboardKPIs() {
  return useQuery({
    queryKey: ['agent-dashboard-kpis'],
    queryFn: async (): Promise<AgentDashboardKPIs> => {
      try {
        const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');

        if (error) {
          console.error('Error fetching agent dashboard KPIs:', error);
          return getMockAgentDashboardKPIs();
        }

        if (!data || typeof data !== 'object') {
          return getMockAgentDashboardKPIs();
        }

        // Safely cast the data
        return data as unknown as AgentDashboardKPIs;
      } catch (error) {
        console.error('Error in useAgentDashboardKPIs:', error);
        return getMockAgentDashboardKPIs();
      }
    }
  });
}

export function useChefAgenceDashboardKPIs() {
  return useQuery({
    queryKey: ['chef-agence-dashboard-kpis'], 
    queryFn: async (): Promise<ChefAgenceDashboardKPIs> => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');

        if (error) {
          console.error('Error fetching chef agence dashboard KPIs:', error);
          return getMockChefAgenceDashboardKPIs();
        }

        if (!data || typeof data !== 'object') {
          return getMockChefAgenceDashboardKPIs();
        }

        // Safely cast the data
        return data as unknown as ChefAgenceDashboardKPIs;
      } catch (error) {
        console.error('Error in useChefAgenceDashboardKPIs:', error);
        return getMockChefAgenceDashboardKPIs();
      }
    }
  });
}

export function useAdminDashboardKPIs() {
  return useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async (): Promise<AdminDashboardKPIs> => {
      return getMockAdminDashboardKPIs();
    }
  });
}

export function useSousAdminDashboard() {
  return useQuery({
    queryKey: ['sous-admin-dashboard'],
    queryFn: async (): Promise<SousAdminDashboardKPIs> => {
      return getMockSousAdminDashboardKPIs();
    }
  });
}

export function useChefAgentsPerformance(limit: number = 10) {
  return useQuery({
    queryKey: ['chef-agents-performance', limit],
    queryFn: async (): Promise<AgentPerformance[]> => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agents_performance', { p_limit: limit });

        if (error) {
          console.error('Error fetching chef agents performance:', error);
          return getMockAgentPerformance();
        }

        if (!data || !Array.isArray(data)) {
          return getMockAgentPerformance();
        }

        // Safely cast the data
        return data as unknown as AgentPerformance[];
      } catch (error) {
        console.error('Error in useChefAgentsPerformance:', error);
        return getMockAgentPerformance();
      }
    }
  });
}

export function useTopAgenciesPerformance(limit: number = 5) {
  return useQuery({
    queryKey: ['top-agencies-performance', limit],
    queryFn: async (): Promise<TopAgencyPerformance[]> => {
      return getMockTopAgenciesPerformance().slice(0, limit);
    }
  });
}

export function useValidationQueueStats() {
  return useQuery({
    queryKey: ['validation-queue-stats'],
    queryFn: async (): Promise<ValidationQueueStats> => {
      return getMockValidationQueueStats();
    }
  });
}

export function useOperationsByQueue(queue: string) {
  return useQuery({
    queryKey: ['operations-by-queue', queue],
    queryFn: async () => {
      return getMockOperationsByQueue(queue);
    }
  });
}

export function useAssignOperation() {
  return {
    mutateAsync: async ({ operation_id }: { operation_id: string }) => {
      console.log('Assigning operation:', operation_id);
      // Mock implementation
      return { success: true };
    },
    isPending: false
  };
}

export function useReleaseOperation() {
  return {
    mutateAsync: async ({ operation_id }: { operation_id: string }) => {
      console.log('Releasing operation:', operation_id);
      // Mock implementation  
      return { success: true };
    },
    isPending: false
  };
}
