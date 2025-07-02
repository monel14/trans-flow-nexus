import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Schéma Zod pour la validation de la configuration système
export const SystemConfigSchema = z.object({
  // Paramètres généraux
  app_name: z.string().min(1, 'Le nom de l\'application est requis'),
  default_currency: z.string().length(3, 'La devise doit faire 3 caractères'),
  timezone: z.string().min(1, 'Le fuseau horaire est requis'),
  max_file_size: z.number().min(1024, 'Taille minimale: 1KB').max(52428800, 'Taille maximale: 50MB'),
  supported_file_types: z.string().min(1, 'Au moins un type de fichier requis'),
  
  // Paramètres de sécurité
  password_min_length: z.number().min(6, 'Minimum 6 caractères').max(32, 'Maximum 32 caractères'),
  password_require_uppercase: z.boolean(),
  password_require_lowercase: z.boolean(),
  password_require_numbers: z.boolean(),
  password_require_symbols: z.boolean(),
  password_expiry_days: z.number().min(30, 'Minimum 30 jours').max(365, 'Maximum 365 jours'),
  session_timeout_minutes: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 heures'),
  max_login_attempts: z.number().min(3, 'Minimum 3 tentatives').max(10, 'Maximum 10 tentatives'),
  lockout_duration_minutes: z.number().min(5, 'Minimum 5 minutes').max(1440, 'Maximum 24 heures'),
  
  // Notifications
  email_notifications_enabled: z.boolean(),
  sms_notifications_enabled: z.boolean(),
  smtp_host: z.string().optional(),
  smtp_port: z.number().min(1).max(65535).optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_encryption: z.enum(['tls', 'ssl', 'none']),
  
  // Templates d'email
  welcome_email_template: z.string().min(1, 'Template requis'),
  operation_validated_template: z.string().min(1, 'Template requis'),
  balance_low_template: z.string().min(1, 'Template requis'),
  
  // Limites
  min_operation_amount: z.number().min(100, 'Minimum 100 FCFA'),
  max_operation_amount: z.number().min(1000, 'Minimum 1000 FCFA'),
  min_recharge_amount: z.number().min(1000, 'Minimum 1000 FCFA'),
  max_recharge_amount: z.number().min(10000, 'Minimum 10000 FCFA'),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

// Hook to get system configuration
export function useSystemConfig() {
  return useSupabaseQuery(
    ['system-config'],
    async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();
      
      if (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        throw error;
      }
      
      // Valider et retourner la configuration
      try {
        return SystemConfigSchema.parse(data.config);
      } catch (validationError) {
        console.error('Erreur de validation de la configuration:', validationError);
        throw new Error('Configuration système invalide');
      }
    }
  );
}

// Hook to update system configuration
export function useUpdateSystemConfig() {
  const { user } = useAuth();
  
  return useSupabaseMutation<SystemConfig, Partial<SystemConfig>>(
    async (configData) => {
      // Récupérer la configuration actuelle
      const { data: currentData, error: fetchError } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();
      
      if (fetchError) {
        throw new Error('Impossible de récupérer la configuration actuelle');
      }
      
      // Fusionner avec les nouvelles données
      const mergedConfig = { ...currentData.config, ...configData };
      
      // Valider la configuration fusionnée
      const validatedConfig = SystemConfigSchema.parse(mergedConfig);
      
      // Mettre à jour dans la base de données
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          config: validatedConfig,
          updated_by: user?.id
        })
        .eq('id', 1)
        .select('config')
        .single();
      
      if (error) {
        throw error;
      }
      
      return SystemConfigSchema.parse(data.config);
    },
    {
      invalidateQueries: [['system-config']],
      successMessage: 'Configuration mise à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour de la configuration',
    }
  );
}

// Hook to get a specific setting
export function useSystemSetting(settingName: keyof SystemConfig) {
  return useSupabaseQuery(
    ['system-setting', settingName],
    async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();
      
      if (error) throw error;
      
      const config = SystemConfigSchema.parse(data.config);
      return config[settingName];
    }
  );
}

// Hook to update a specific setting
export function useUpdateSystemSetting() {
  const { user } = useAuth();
  
  return useSupabaseMutation<any, {
    settingName: keyof SystemConfig;
    value: any;
  }>(
    async ({ settingName, value }) => {
      // Récupérer la configuration actuelle
      const { data: currentData, error: fetchError } = await supabase
        .from('system_settings')
        .select('config')
        .eq('id', 1)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Mettre à jour le paramètre spécifique
      const updatedConfig = {
        ...currentData.config,
        [settingName]: value
      };
      
      // Valider la configuration mise à jour
      const validatedConfig = SystemConfigSchema.parse(updatedConfig);
      
      // Sauvegarder
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          config: validatedConfig,
          updated_by: user?.id 
        })
        .eq('id', 1);
      
      if (error) throw error;
      
      return { [settingName]: value };
    },
    {
      invalidateQueries: [['system-config'], ['system-setting']],
      successMessage: 'Paramètre mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour du paramètre',
    }
  );
}