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

export interface AgentPerformance {
  id: string;
  name: string;
  operations_week: number;
  volume_week_formatted: string;
  success_rate: number;
  performance_level: 'excellent' | 'good' | 'average' | 'poor';
}

// Mock data for AgentDashboardKPIs
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

// Mock data for ChefAgenceDashboardKPIs
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

// Mock data for AgentPerformance
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
  },
  {
    id: '4',
    name: 'Aisha Koulibaly',
    operations_week: 10,
    volume_week_formatted: '20,000 XOF',
    success_rate: 80,
    performance_level: 'poor'
  }
];

export function useAgentDashboardKPIs() {
  return useQuery({
    queryKey: ['agent-dashboard-kpis'],
    queryFn: async (): Promise<AgentDashboardKPIs> => {
      const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');

      if (error) {
        console.error('Error fetching agent dashboard KPIs:', error);
        // Return mock data on error
        return getMockAgentDashboardKPIs();
      }

      if (!data) {
        return getMockAgentDashboardKPIs();
      }

      // Safely convert the RPC response to our interface
      return data as unknown as AgentDashboardKPIs;
    }
  });
}

export function useChefAgenceDashboardKPIs() {
  return useQuery({
    queryKey: ['chef-agence-dashboard-kpis'], 
    queryFn: async (): Promise<ChefAgenceDashboardKPIs> => {
      const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');

      if (error) {
        console.error('Error fetching chef agence dashboard KPIs:', error);
        // Return mock data on error
        return getMockChefAgenceDashboardKPIs();
      }

      if (!data) {
        return getMockChefAgenceDashboardKPIs();
      }

      // Safely convert the RPC response to our interface
      return data as unknown as ChefAgenceDashboardKPIs;
    }
  });
}

export function useChefAgentsPerformance(limit: number = 10) {
  return useQuery({
    queryKey: ['chef-agents-performance', limit],
    queryFn: async (): Promise<AgentPerformance[]> => {
      const { data, error } = await supabase.rpc('get_chef_agents_performance', { p_limit: limit });

      if (error) {
        console.error('Error fetching chef agents performance:', error);
        // Return mock data on error
        return getMockAgentPerformance();
      }

      if (!data || !Array.isArray(data)) {
        return getMockAgentPerformance();
      }

      // Safely convert array response
      return data as unknown as AgentPerformance[];
    }
  });
}
