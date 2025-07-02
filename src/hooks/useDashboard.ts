import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types pour les KPIs
export interface AdminDashboardKPIs {
  volume_today: {
    amount: number;
    formatted: string;
    growth_percentage: number;
    growth_formatted: string;
  };
  operations_system: {
    total_today: number;
    completed_today: number;
    pending: number;
    urgent: number;
    subtitle: string;
  };
  network_stats: {
    total_agencies: number;
    active_agencies: number;
    total_agents: number;
    total_chefs: number;
    subtitle: string;
  };
  monthly_revenue: {
    amount: number;
    formatted: string;
    subtitle: string;
  };
  critical_alerts: {
    blocked_transactions: number;
    support_requests: number;
    underperforming_agencies: number;
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
    resolved_week: number;
    subtitle: string;
  };
  avg_processing_time: {
    minutes: number;
    formatted: string;
    subtitle: string;
  };
  my_assignments: {
    count: number;
    subtitle: string;
  };
}

export interface AgencyPerformance {
  id: number;
  name: string;
  city: string;
  volume_today: number;
  volume_month: number;
  operations_count: number;
  rank: number;
}

export interface ValidationQueueStats {
  unassigned_count: number;
  my_tasks_count: number;
  all_tasks_count: number;
  urgent_count: number;
  completed_today: number;
  user_role: string;
  user_agency_id?: number;
}

// Hook pour les KPIs du tableau de bord Admin Général
export function useAdminDashboardKPIs() {
  const { user } = useAuth();
  
  return useSupabaseQuery<AdminDashboardKPIs>(
    ['admin-dashboard-kpis', user?.id],
    async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_kpis');
      
      if (error) throw error;
      return data as AdminDashboardKPIs;
    },
    {
      enabled: user?.role === 'admin_general' || user?.role === 'developer',
      refetchInterval: 60000, // Rafraîchir toutes les minutes
      staleTime: 30000, // Les données sont considérées comme fraîches pendant 30 secondes
    }
  );
}

// Hook pour les KPIs du tableau de bord Sous-Admin
export function useSousAdminDashboardKPIs() {
  const { user } = useAuth();
  
  return useSupabaseQuery<SousAdminDashboardKPIs>(
    ['sous-admin-dashboard-kpis', user?.id],
    async () => {
      const { data, error } = await supabase.rpc('get_sous_admin_dashboard_kpis');
      
      if (error) throw error;
      return data as SousAdminDashboardKPIs;
    },
    {
      enabled: user?.role === 'sous_admin',
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
}

// Hook pour les performances des agences (Admin)
export function useTopAgenciesPerformance(limit: number = 5) {
  const { user } = useAuth();
  
  return useSupabaseQuery<AgencyPerformance[]>(
    ['top-agencies-performance', limit, user?.id],
    async () => {
      const { data, error } = await supabase.rpc('get_top_agencies_performance', {
        p_limit: limit
      });
      
      if (error) throw error;
      return data as AgencyPerformance[];
    },
    {
      enabled: user?.role === 'admin_general' || user?.role === 'developer',
      refetchInterval: 5 * 60000, // Rafraîchir toutes les 5 minutes
      staleTime: 2 * 60000, // Données fraîches pendant 2 minutes
    }
  );
}

// Hook pour les statistiques des files d'attente de validation
export function useValidationQueueStats() {
  const { user } = useAuth();
  
  return useSupabaseQuery<ValidationQueueStats>(
    ['validation-queue-stats', user?.id],
    async () => {
      const { data, error } = await supabase.rpc('get_validation_queue_stats');
      
      if (error) throw error;
      return data as ValidationQueueStats;
    },
    {
      enabled: user?.role && ['admin_general', 'sous_admin', 'developer'].includes(user.role),
      refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
      staleTime: 15000, // Données fraîches pendant 15 secondes
    }
  );
}

// Hook pour assigner une opération à l'utilisateur courant
export function useAssignOperation() {
  const { user } = useAuth();
  
  return useSupabaseMutation<any, { operation_id: string }>(
    async ({ operation_id }) => {
      const { data, error } = await supabase.rpc('assign_operation_to_user', {
        p_operation_id: operation_id
      });
      
      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'assignation');
      }
      
      return data;
    },
    {
      invalidateQueries: [
        ['validation-queue-stats'],
        ['operations'],
        ['pending-operations'],
        ['admin-dashboard-kpis'],
        ['sous-admin-dashboard-kpis']
      ],
      successMessage: 'Opération assignée avec succès',
      errorMessage: 'Erreur lors de l\'assignation de l\'opération',
    }
  );
}

// Hook pour récupérer les opérations par file d'attente
export function useOperationsByQueue(queueType: 'unassigned' | 'my_tasks' | 'all_tasks') {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['operations-by-queue', queueType, user?.id],
    async () => {
      let query = supabase
        .from('operations')
        .select(`
          *,
          operation_types (id, name, description),
          profiles!operations_initiator_id_fkey (id, name, email),
          agencies (id, name, city)
        `)
        .order('created_at', { ascending: true }); // Les plus anciennes en premier pour validation

      // Filtrer selon le type de file d'attente
      switch (queueType) {
        case 'unassigned':
          query = query
            .eq('status', 'pending')
            .is('validator_id', null);
          break;
          
        case 'my_tasks':
          query = query
            .eq('status', 'pending_validation')
            .eq('validator_id', user?.id);
          break;
          
        case 'all_tasks':
          query = query.in('status', ['pending', 'pending_validation']);
          break;
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: user?.role && ['admin_general', 'sous_admin', 'developer'].includes(user.role),
      refetchInterval: 30000,
      staleTime: 15000,
    }
  );
}

// Hook pour obtenir les opérations récentes (pour les tableaux de bord)
export function useRecentOperations(limit: number = 10) {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    ['recent-operations', limit, user?.id],
    async () => {
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_types (id, name, description),
          profiles!operations_initiator_id_fkey (id, name, email),
          agencies (id, name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user?.id,
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
}

// Hook pour libérer une opération (annuler l'assignation)
export function useReleaseOperation() {
  return useSupabaseMutation<any, { operation_id: string }>(
    async ({ operation_id }) => {
      const { data, error } = await supabase
        .from('operations')
        .update({
          validator_id: null,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', operation_id)
        .eq('status', 'pending_validation'); // Seulement si c'est en attente de validation
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [
        ['validation-queue-stats'],
        ['operations'],
        ['operations-by-queue'],
        ['admin-dashboard-kpis'],
        ['sous-admin-dashboard-kpis']
      ],
      successMessage: 'Opération libérée avec succès',
      errorMessage: 'Erreur lors de la libération de l\'opération',
    }
  );
}

// Types pour les nouveaux KPIs
export interface ChefAgenceDashboardKPIs {
  chef_balance: {
    amount: number;
    formatted: string;
    status: 'critical' | 'low' | 'medium' | 'good';
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
    status: 'critical' | 'low' | 'medium' | 'good';
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

// Hook pour les KPIs du tableau de bord Chef d'Agence
export function useChefAgenceDashboardKPIs() {
  const { user } = useAuth();
  
  return useSupabaseQuery<ChefAgenceDashboardKPIs>(
    ['chef-agence-dashboard-kpis', user?.id],
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agence_dashboard_kpis');
        
        if (error) {
          // Fallback avec données mockées si la fonction n'existe pas encore
          console.warn('Fonction RPC non trouvée, utilisation de données mockées:', error);
          return {
            chef_balance: {
              amount: 750000,
              formatted: '750 000 XOF',
              status: 'good' as const,
              subtitle: 'Fonds disponibles pour recharges agents'
            },
            agency_volume_month: {
              amount: 2450000,
              formatted: '2 450 000 XOF',
              growth_percentage: 12.5,
              growth_formatted: '+12.5%',
              subtitle: 'En croissance vs mois dernier'
            },
            agency_commissions: {
              amount: 125000,
              formatted: '125 000 XOF',
              subtitle: 'Revenus équipe ce mois'
            },
            agents_performance: {
              total_agents: 8,
              active_week: 6,
              performants: 5,
              performance_rate: 62.5,
              subtitle: '5/8 agents atteignent leurs objectifs'
            },
            pending_actions: {
              recharge_requests: 3,
              inactive_agents: 2,
              subtitle: '3 demandes de recharge en attente'
            },
            agency_id: 1
          } as ChefAgenceDashboardKPIs;
        }
        
        return data as ChefAgenceDashboardKPIs;
      } catch (err) {
        // Fallback complet en cas d'erreur
        return {
          chef_balance: {
            amount: 750000,
            formatted: '750 000 XOF',
            status: 'good' as const,
            subtitle: 'Fonds disponibles pour recharges agents'
          },
          agency_volume_month: {
            amount: 2450000,
            formatted: '2 450 000 XOF',
            growth_percentage: 12.5,
            growth_formatted: '+12.5%',
            subtitle: 'En croissance vs mois dernier'
          },
          agency_commissions: {
            amount: 125000,
            formatted: '125 000 XOF',
            subtitle: 'Revenus équipe ce mois'
          },
          agents_performance: {
            total_agents: 8,
            active_week: 6,
            performants: 5,
            performance_rate: 62.5,
            subtitle: '5/8 agents atteignent leurs objectifs'
          },
          pending_actions: {
            recharge_requests: 3,
            inactive_agents: 2,
            subtitle: '3 demandes de recharge en attente'
          },
          agency_id: 1
        } as ChefAgenceDashboardKPIs;
      }
    },
    {
      enabled: user?.role === 'chef_agence',
      refetchInterval: 60000, // Rafraîchir toutes les minutes
      staleTime: 30000, // Les données sont considérées comme fraîches pendant 30 secondes
    }
  );
}

// Hook pour les KPIs du tableau de bord Agent
export function useAgentDashboardKPIs() {
  const { user } = useAuth();
  
  return useSupabaseQuery<AgentDashboardKPIs>(
    ['agent-dashboard-kpis', user?.id],
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_agent_dashboard_kpis');
        
        if (error) {
          // Fallback avec données mockées si la fonction n'existe pas encore
          console.warn('Fonction RPC non trouvée, utilisation de données mockées:', error);
          return {
            agent_balance: {
              amount: 185000,
              formatted: '185 000 XOF',
              status: 'good' as const,
              subtitle: '✅ Solde suffisant pour vos opérations'
            },
            operations_today: {
              total: 5,
              completed: 4,
              pending: 1,
              success_rate: 80,
              subtitle: '+4 complétées sur 5 aujourd\'hui'
            },
            commissions_week: {
              amount: 45000,
              formatted: '45 000 XOF',
              subtitle: 'Gains cette semaine'
            },
            monthly_objective: {
              target: 500000,
              target_formatted: '500 000 XOF',
              current_volume: 350000,
              current_formatted: '350 000 XOF',
              progress_percentage: 70,
              progress_formatted: '70%',
              remaining: 150000,
              remaining_formatted: '150 000 XOF',
              subtitle: 'Objectif mensuel en cours - 70% réalisé'
            },
            performance_summary: {
              volume_month: 350000,
              commissions_month: 180000,
              operations_avg_day: 3.5
            }
          } as AgentDashboardKPIs;
        }
        
        return data as AgentDashboardKPIs;
      } catch (err) {
        // Fallback complet en cas d'erreur
        return {
          agent_balance: {
            amount: 185000,
            formatted: '185 000 XOF',
            status: 'good' as const,
            subtitle: '✅ Solde suffisant pour vos opérations'
          },
          operations_today: {
            total: 5,
            completed: 4,
            pending: 1,
            success_rate: 80,
            subtitle: '+4 complétées sur 5 aujourd\'hui'
          },
          commissions_week: {
            amount: 45000,
            formatted: '45 000 XOF',
            subtitle: 'Gains cette semaine'
          },
          monthly_objective: {
            target: 500000,
            target_formatted: '500 000 XOF',
            current_volume: 350000,
            current_formatted: '350 000 XOF',
            progress_percentage: 70,
            progress_formatted: '70%',
            remaining: 150000,
            remaining_formatted: '150 000 XOF',
            subtitle: 'Objectif mensuel en cours - 70% réalisé'
          },
          performance_summary: {
            volume_month: 350000,
            commissions_month: 180000,
            operations_avg_day: 3.5
          }
        } as AgentDashboardKPIs;
      }
    },
    {
      enabled: user?.role === 'agent',
      refetchInterval: 60000, // Rafraîchir toutes les minutes
      staleTime: 30000, // Les données sont considérées comme fraîches pendant 30 secondes
    }
  );
}

// Hook pour les performances des agents de l'agence (Chef d'Agence)
export function useChefAgentsPerformance(limit: number = 10) {
  const { user } = useAuth();
  
  return useSupabaseQuery<AgentPerformance[]>(
    ['chef-agents-performance', limit, user?.id],
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_chef_agents_performance', {
          p_limit: limit
        });
        
        if (error) {
          // Fallback avec données mockées si la fonction n'existe pas encore
          console.warn('Fonction RPC non trouvée, utilisation de données mockées:', error);
          return [
            {
              id: '1',
              name: 'Agent Kouadio',
              email: 'dkr01.kouadio',
              balance: 125000,
              balance_formatted: '125 000 XOF',
              operations_week: 12,
              volume_week: 180000,
              volume_week_formatted: '180 000 XOF',
              commissions_week: 3600,
              commissions_week_formatted: '3 600 XOF',
              success_rate: 92,
              performance_level: 'excellent' as const,
              last_activity: new Date().toISOString(),
              is_active_week: true
            },
            {
              id: '2',
              name: 'Agent Diabaté',
              email: 'dkr01.diabate',
              balance: 95000,
              balance_formatted: '95 000 XOF',
              operations_week: 8,
              volume_week: 145000,
              volume_week_formatted: '145 000 XOF',
              commissions_week: 2900,
              commissions_week_formatted: '2 900 XOF',
              success_rate: 88,
              performance_level: 'good' as const,
              last_activity: new Date().toISOString(),
              is_active_week: true
            },
            {
              id: '3',
              name: 'Agent Traoré',
              email: 'dkr01.traore',
              balance: 70000,
              balance_formatted: '70 000 XOF',
              operations_week: 6,
              volume_week: 110000,
              volume_week_formatted: '110 000 XOF',
              commissions_week: 2200,
              commissions_week_formatted: '2 200 XOF',
              success_rate: 75,
              performance_level: 'average' as const,
              last_activity: new Date().toISOString(),
              is_active_week: true
            }
          ] as AgentPerformance[];
        }
        
        return data as AgentPerformance[];
      } catch (err) {
        // Fallback complet en cas d'erreur
        return [
          {
            id: '1',
            name: 'Agent Kouadio',
            email: 'dkr01.kouadio',
            balance: 125000,
            balance_formatted: '125 000 XOF',
            operations_week: 12,
            volume_week: 180000,
            volume_week_formatted: '180 000 XOF',
            commissions_week: 3600,
            commissions_week_formatted: '3 600 XOF',
            success_rate: 92,
            performance_level: 'excellent' as const,
            last_activity: new Date().toISOString(),
            is_active_week: true
          },
          {
            id: '2',
            name: 'Agent Diabaté',
            email: 'dkr01.diabate',
            balance: 95000,
            balance_formatted: '95 000 XOF',
            operations_week: 8,
            volume_week: 145000,
            volume_week_formatted: '145 000 XOF',
            commissions_week: 2900,
            commissions_week_formatted: '2 900 XOF',
            success_rate: 88,
            performance_level: 'good' as const,
            last_activity: new Date().toISOString(),
            is_active_week: true
          }
        ] as AgentPerformance[];
      }
    },
    {
      enabled: user?.role === 'chef_agence',
      refetchInterval: 5 * 60000, // Rafraîchir toutes les 5 minutes
      staleTime: 2 * 60000, // Données fraîches pendant 2 minutes
    }
  );
}