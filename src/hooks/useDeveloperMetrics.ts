
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDeveloperMetrics = () => {
  return useQuery({
    queryKey: ['developer-metrics'],
    queryFn: async () => {
      // Récupérer le nombre total d'opérations (on utilisera operation_types comme proxy)
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
        uptimePercentage: 100 // Statique pour l'instant
      };
    },
  });
};
