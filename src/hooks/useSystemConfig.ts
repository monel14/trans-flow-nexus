
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemConfigData {
  systemName: string;
  maintenanceMode: boolean;
  maxFileSize: string;
  sessionTimeout: string;
  passwordMinLength: string;
  enableTwoFactor: boolean;
  maxLoginAttempts: string;
  backupFrequency: string;
  retentionDays: string;
  enableReplication: boolean;
}

const defaultConfig: SystemConfigData = {
  systemName: "TransFlow",
  maintenanceMode: false,
  maxFileSize: "10",
  sessionTimeout: "30",
  passwordMinLength: "8",
  enableTwoFactor: false,
  maxLoginAttempts: "5",
  backupFrequency: "daily",
  retentionDays: "90",
  enableReplication: true,
};

export const useSystemConfig = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      // Pour l'instant, on utilise les valeurs par défaut
      // Plus tard, on pourra récupérer depuis une table system_config
      return defaultConfig;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<SystemConfigData>) => {
      // Simuler la sauvegarde - à remplacer par un appel Supabase
      console.log('Sauvegarde de la configuration:', newConfig);
      return { ...config, ...newConfig };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });

  return {
    config: config || defaultConfig,
    isLoading,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};
