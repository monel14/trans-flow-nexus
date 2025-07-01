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

// Hook to get system configuration
export function useSystemConfig() {
  return useSupabaseQuery(
    ['system-config'],
    async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      // Return default config if no settings exist
      if (!data) {
        return {
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
        } as SystemConfig;
      }
      
      return data as SystemConfig;
    }
  );
}

// Hook to update system configuration
export function useUpdateSystemConfig() {
  return useSupabaseMutation<SystemConfig, Partial<SystemConfig>>(
    async (configData) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      let result;
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('system_settings')
          .update({
            settings: configData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('system_settings')
          .insert({
            name: 'global_config',
            settings: configData,
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return result.settings as SystemConfig;
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
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings')
        .eq('name', settingName)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data?.settings || null;
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
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id, settings')
        .eq('name', settingName)
        .single();
      
      if (existing) {
        // Update existing setting
        const updatedSettings = {
          ...existing.settings,
          [settingName]: value,
        };
        
        const { data, error } = await supabase
          .from('system_settings')
          .update({
            settings: updatedSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data.settings;
      } else {
        // Create new setting
        const { data, error } = await supabase
          .from('system_settings')
          .insert({
            name: settingName,
            settings: { [settingName]: value },
          })
          .select()
          .single();
        
        if (error) throw error;
        return data.settings;
      }
    },
    {
      invalidateQueries: [['system-config'], ['system-setting']],
      successMessage: 'Paramètre mis à jour',
      errorMessage: 'Erreur lors de la mise à jour',
    }
  );
}