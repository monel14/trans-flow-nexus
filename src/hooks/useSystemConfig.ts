
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SystemSettings {
  id: number;
  config: Record<string, any>;
  updated_by?: string;
  updated_at: string;
}

export interface SystemConfig {
  app_name: string;
  timezone: string;
  default_currency: string;
  max_file_size: number;
  supported_file_types: string;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
  password_min_length: number;
  password_expiry_days: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  welcome_email_template: string;
  balance_low_template: string;
  operation_validated_template: string;
  min_operation_amount: number;
  max_operation_amount: number;
  min_recharge_amount: number;
  max_recharge_amount: number;
}

const defaultConfig: SystemConfig = {
  app_name: "TransFlow Nexus",
  timezone: "Africa/Ouagadougou", 
  default_currency: "XOF",
  max_file_size: 5242880,
  supported_file_types: "image/jpeg,image/png,application/pdf",
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  session_timeout_minutes: 60,
  password_min_length: 8,
  password_expiry_days: 90,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  email_notifications_enabled: true,
  sms_notifications_enabled: false,
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  welcome_email_template: "Bienvenue sur TransFlow Nexus!\n\nVotre compte a été créé avec succès.",
  balance_low_template: "Attention: Votre solde est faible ({balance}).",
  operation_validated_template: "Votre opération #{operation_id} a été validée.",
  min_operation_amount: 1000,
  max_operation_amount: 10000000,
  min_recharge_amount: 10000,
  max_recharge_amount: 5000000
};

export function useSystemConfig() {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async (): Promise<SystemConfig> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error loading system config:', error);
        return defaultConfig;
      }

      if (!data || !data.config) {
        return defaultConfig;
      }

      // Safely merge the config with defaults
      const config = typeof data.config === 'object' && data.config !== null 
        ? { ...defaultConfig, ...data.config } 
        : defaultConfig;

      return config as SystemConfig;
    }
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newConfig: Partial<SystemConfig>) => {
      // Get current config first
      const { data: currentData } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();

      const currentConfig = currentData?.config && typeof currentData.config === 'object' 
        ? currentData.config as Record<string, any>
        : {};

      const updatedConfig = { ...currentConfig, ...newConfig };

      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          config: updatedConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast({
        title: "Succès",
        description: "Configuration système mise à jour avec succès."
      });
    },
    onError: (error: any) => {
      console.error('Error updating system config:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de mettre à jour la configuration système.",
        variant: "destructive"
      });
    }
  });
}

export function useResetSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          config: defaultConfig,
          updated_at: new Date().toISOString() 
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast({
        title: "Succès",
        description: "Configuration système réinitialisée aux valeurs par défaut."
      });
    }
  });
}
