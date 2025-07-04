
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  app_name: string;
  timezone: string;
  default_currency: string;
  max_file_size: number;
  supported_file_types: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  password_expiry_days: number;
  min_operation_amount: number;
  max_operation_amount: number;
  min_recharge_amount: number;
  max_recharge_amount: number;
  welcome_email_template: string;
  balance_low_template: string;
  operation_validated_template: string;
}

// Default configuration
const defaultConfig: SystemConfig = {
  app_name: "TransFlow Nexus",
  timezone: "Africa/Ouagadougou", 
  default_currency: "XOF",
  max_file_size: 5242880,
  supported_file_types: "image/jpeg,image/png,application/pdf",
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  email_notifications_enabled: true,
  sms_notifications_enabled: false,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  session_timeout_minutes: 60,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  password_expiry_days: 90,
  min_operation_amount: 1000,
  max_operation_amount: 10000000,
  min_recharge_amount: 10000,
  max_recharge_amount: 5000000,
  welcome_email_template: "Bienvenue sur TransFlow Nexus!\\n\\nVotre compte a été créé avec succès.",
  balance_low_template: "Attention: Votre solde est faible ({balance}).",
  operation_validated_template: "Votre opération #{operation_id} a été validée."
};

export function useSystemConfig() {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async (): Promise<SystemConfig> => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('config')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching system config:', error);
          return defaultConfig;
        }

        if (!data?.config) {
          return defaultConfig;
        }

        // Safely cast the data with proper type checking
        const configData = data.config as unknown;
        if (typeof configData === 'object' && configData !== null && !Array.isArray(configData)) {
          return { ...defaultConfig, ...(configData as Partial<SystemConfig>) };
        }

        return defaultConfig;
      } catch (error) {
        console.error('Error in useSystemConfig:', error);
        return defaultConfig;
      }
    }
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<SystemConfig>) => {
      const { data: currentData } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();

      const currentConfig = currentData?.config as SystemConfig || defaultConfig;
      const updatedConfig = { ...currentConfig, ...config };

      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          config: updatedConfig as any,
          updated_at: new Date().toISOString(),
          updated_by: 'system'
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
}

export function useInitializeSystemConfig() {
  return useMutation({
    mutationFn: async () => {
      // Check if config exists
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('id', 1)
        .single();

      if (!existing) {
        // Insert default config
        const { data, error } = await supabase
          .from('system_settings')
          .insert({
            id: 1,
            config: defaultConfig as any,
            updated_by: 'system'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      }

      return existing;
    },
  });
}
