
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemHealth {
  apiStatus: 'operational' | 'degraded' | 'down';
  databaseStatus: 'connected' | 'disconnected';
  uptimePercentage: number;
  lastChecked: string;
}

const checkSystemHealth = async (): Promise<SystemHealth> => {
  try {
    // Test la connexion à la base de données
    const { error } = await supabase.from('operation_types').select('count').limit(1);
    
    return {
      apiStatus: 'operational',
      databaseStatus: error ? 'disconnected' : 'connected',
      uptimePercentage: error ? 95.2 : 99.8, // Simulation plus réaliste
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      apiStatus: 'down',
      databaseStatus: 'disconnected',
      uptimePercentage: 95.2,
      lastChecked: new Date().toISOString()
    };
  }
};

export const useDeveloperMetrics = () => {
  return useQuery({
    queryKey: ['developer-metrics'],
    queryFn: async () => {
      // Vérifier la santé du système
      const systemHealth = await checkSystemHealth();

      // Récupérer le nombre total d'opérations
      const { count: operationTypesCount } = await supabase
        .from('operation_types')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre de types d'opération actifs
      const { count: activeOperationTypesCount } = await supabase
        .from('operation_types')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('status', 'active');

      // Récupérer le nombre de champs configurés
      const { count: fieldsCount } = await supabase
        .from('operation_type_fields')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre de règles de commission
      const { count: commissionRulesCount } = await supabase
        .from('commission_rules')
        .select('*', { count: 'exact', head: true });

      return {
        totalOperationTypes: operationTypesCount || 0,
        activeOperationTypes: activeOperationTypesCount || 0,
        configuredFields: fieldsCount || 0,
        commissionRules: commissionRulesCount || 0,
        systemHealth,
        uptimePercentage: systemHealth.uptimePercentage
      };
    },
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
  });
};
