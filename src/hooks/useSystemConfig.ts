import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  // Paramètres généraux
  app_name: string;
  default_currency: string;
  timezone: string;
  max_file_size: number;
  supported_file_types: string;
  
  // Paramètres de sécurité
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  password_expiry_days: number;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  
  // Notifications
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  
  // Templates d'email
  welcome_email_template: string;
  operation_validated_template: string;
  balance_low_template: string;
  
  // Limites
  min_operation_amount: number;
  max_operation_amount: number;
  min_recharge_amount: number;
  max_recharge_amount: number;
}

// Since system_settings table doesn't exist in the current schema,
// we'll use a simple in-memory configuration that can be extended later
const DEFAULT_CONFIG: SystemConfig = {
  app_name: 'TransFlow Nexus',
  default_currency: 'XOF',
  timezone: 'Africa/Ouagadougou',
  max_file_size: 5242880,
  supported_file_types: 'image/jpeg,image/png,application/pdf',
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  password_expiry_days: 90,
  session_timeout_minutes: 60,
  max_login_attempts: 5,
  lockout_duration_minutes: 30,
  email_notifications_enabled: true,
  sms_notifications_enabled: false,
  smtp_host: '',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'tls',
  welcome_email_template: 'Bienvenue sur TransFlow Nexus!\n\nVotre compte a été créé avec succès.',
  operation_validated_template: 'Votre opération #{operation_id} a été validée.',
  balance_low_template: 'Attention: Votre solde est faible ({balance}).',
  min_operation_amount: 1000,
  max_operation_amount: 10000000,
  min_recharge_amount: 10000,
  max_recharge_amount: 5000000,
};

// Hook to get system configuration
export function useSystemConfig() {
  return useSupabaseQuery(
    ['system-config'],
    async () => {
      // For now, return the default configuration
      // This can be extended later when system_settings table is created
      return DEFAULT_CONFIG;
    }
  );
}

// Hook to update system configuration
export function useUpdateSystemConfig() {
  return useSupabaseMutation<SystemConfig, Partial<SystemConfig>>(
    async (configData) => {
      // For now, just return the merged configuration
      // This should be implemented when system_settings table is created
      const updatedConfig = { ...DEFAULT_CONFIG, ...configData };
      
      // TODO: Implement actual database storage when system_settings table is available
      // const { data, error } = await supabase
      //   .from('system_settings')
      //   .upsert({ id: 'global', settings: updatedConfig })
      //   .select()
      //   .single();
      
      return updatedConfig;
    },
    {
      invalidateQueries: [['system-config']],
      successMessage: 'Configuration mise à jour',
      errorMessage: 'Erreur lors de la mise à jour',
    }
  );
}

// Hook to get a specific setting
export function useSystemSetting(settingName: string) {
  return useSupabaseQuery(
    ['system-setting', settingName],
    async () => {
      // Return the specific setting from default config
      return DEFAULT_CONFIG[settingName as keyof SystemConfig] || null;
    }
  );
}

// Hook to update a specific setting
export function useUpdateSystemSetting() {
  return useSupabaseMutation<any, {
    settingName: string;
    value: any;
  }>(
    async ({ settingName, value }) => {
      // For now, just return the updated value
      // This should be implemented when system_settings table is created
      return { [settingName]: value };
    },
    {
      invalidateQueries: [['system-config'], ['system-setting']],
      successMessage: 'Paramètre mis à jour',
      errorMessage: 'Erreur lors de la mise à jour',
    }
  );
}