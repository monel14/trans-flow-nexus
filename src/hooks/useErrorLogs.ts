import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Schéma Zod pour la validation des logs d'erreurs
export const ErrorLogSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  level: z.enum(['error', 'warning', 'info', 'debug', 'critical']),
  source: z.enum(['api', 'database', 'frontend', 'system', 'external']),
  message: z.string(),
  stack_trace: z.string().optional(),
  context: z.any().optional(),
  user_id: z.string().optional(),
  user_name: z.string().optional(),
  request_url: z.string().optional(),
  request_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
  response_status: z.number().min(100).max(599).optional(),
  session_id: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  resolved: z.boolean(),
  resolved_at: z.string().optional(),
  resolved_by: z.string().optional(),
  resolution_notes: z.string().optional(),
  created_at: z.string(),
});

export type ErrorLog = z.infer<typeof ErrorLogSchema>;

export interface ErrorLogFilters {
  level?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  resolved?: boolean;
  limit?: number;
}

export interface CreateErrorLogData {
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical';
  source: 'api' | 'database' | 'frontend' | 'system' | 'external';
  message: string;
  stack_trace?: string;
  context?: any;
  request_url?: string;
  request_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  response_status?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// Hook to get error logs with filters
export function useErrorLogs(filters?: ErrorLogFilters) {
  return useSupabaseQuery(
    ['error-logs', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }
      
      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }
      
      if (filters?.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters?.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(1000); // Default limit
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erreur lors du chargement des logs:', error);
        throw error;
      }
      
      // Valider et retourner les logs
      return (data || []).map(log => ErrorLogSchema.parse(log));
    }
  );
}

// Hook to create an error log entry
export function useCreateErrorLog() {
  const { user } = useAuth();
  
  return useSupabaseMutation<ErrorLog, CreateErrorLogData>(
    async (logData) => {
      const { data, error } = await supabase
        .from('error_logs')
        .insert({
          level: logData.level,
          source: logData.source,
          message: logData.message,
          stack_trace: logData.stack_trace,
          context: logData.context || {},
          request_url: logData.request_url,
          request_method: logData.request_method,
          response_status: logData.response_status,
          session_id: logData.session_id,
          ip_address: logData.ip_address,
          user_agent: logData.user_agent,
          user_id: user?.id,
          user_name: user?.user_metadata?.name || user?.email,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création du log:', error);
        throw error;
      }
      
      return ErrorLogSchema.parse(data);
    },
    {
      invalidateQueries: [['error-logs']],
      successMessage: 'Log d\'erreur créé avec succès',
      errorMessage: 'Erreur lors de la création du log',
    }
  );
}

// Hook to clear error logs
export function useClearErrorLogs() {
  return useSupabaseMutation<any, {
    beforeDate?: string;
    level?: string;
    source?: string;
    resolved?: boolean;
  }>(
    async (clearOptions) => {
      let query = supabase
        .from('error_logs')
        .delete();
      
      if (clearOptions.beforeDate) {
        query = query.lte('created_at', clearOptions.beforeDate);
      }
      
      if (clearOptions.level) {
        query = query.eq('level', clearOptions.level);
      }
      
      if (clearOptions.source) {
        query = query.eq('source', clearOptions.source);
      }
      
      if (clearOptions.resolved !== undefined) {
        query = query.eq('resolved', clearOptions.resolved);
      }
      
      const { error } = await query;
      
      if (error) {
        console.error('Erreur lors de la suppression des logs:', error);
        throw error;
      }
      
      return { success: true };
    },
    {
      invalidateQueries: [['error-logs']],
      successMessage: 'Logs supprimés avec succès',
      errorMessage: 'Erreur lors de la suppression des logs',
    }
  );
}

// Hook to resolve an error log
export function useResolveErrorLog() {
  const { user } = useAuth();
  
  return useSupabaseMutation<ErrorLog, {
    logId: number;
    resolutionNotes?: string;
  }>(
    async ({ logId, resolutionNotes }) => {
      const { data, error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: resolutionNotes,
        })
        .eq('id', logId)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la résolution du log:', error);
        throw error;
      }
      
      return ErrorLogSchema.parse(data);
    },
    {
      invalidateQueries: [['error-logs']],
      successMessage: 'Log marqué comme résolu',
      errorMessage: 'Erreur lors de la résolution du log',
    }
  );
}

// Hook to get error log statistics
export function useErrorLogStats() {
  return useSupabaseQuery(
    ['error-log-stats'],
    async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('level, created_at, resolved');
      
      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        throw error;
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: data?.length || 0,
        errors: data?.filter(log => log.level === 'error').length || 0,
        warnings: data?.filter(log => log.level === 'warning').length || 0,
        critical: data?.filter(log => log.level === 'critical').length || 0,
        unresolved: data?.filter(log => !log.resolved).length || 0,
        today: data?.filter(log => new Date(log.created_at) >= today).length || 0,
        thisWeek: data?.filter(log => new Date(log.created_at) >= thisWeek).length || 0,
        thisMonth: data?.filter(log => new Date(log.created_at) >= thisMonth).length || 0,
      };
      
      return stats;
    }
  );
}

// Helper function to log errors from anywhere in the app
export function logError(
  message: string,
  error?: Error,
  context?: any,
  source: 'api' | 'database' | 'frontend' | 'system' | 'external' = 'frontend'
) {
  // Pour le développement, on peut utiliser directement le client Supabase
  const errorData: CreateErrorLogData = {
    level: 'error',
    source,
    message,
    stack_trace: error?.stack,
    context: {
      ...context,
      error_name: error?.name,
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
    request_url: typeof window !== 'undefined' ? window.location.href : undefined,
    request_method: 'GET', // Default, could be detected in actual implementation
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  // Log immédiatement à la console pour le développement
  console.error('Error logged:', errorData);
  
  // Envoyer à Supabase (async, sans attendre)
  supabase
    .from('error_logs')
    .insert(errorData)
    .then(({ error: insertError }) => {
      if (insertError) {
        console.error('Failed to log error to database:', insertError);
      }
    });
}

// Helper function pour logger des erreurs de différents niveaux
export function logWarning(message: string, context?: any, source: 'api' | 'database' | 'frontend' | 'system' | 'external' = 'frontend') {
  const warningData: CreateErrorLogData = {
    level: 'warning',
    source,
    message,
    context,
    request_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  console.warn('Warning logged:', warningData);
  
  supabase
    .from('error_logs')
    .insert(warningData)
    .then(({ error }) => {
      if (error) console.error('Failed to log warning:', error);
    });
}

export function logInfo(message: string, context?: any, source: 'api' | 'database' | 'frontend' | 'system' | 'external' = 'system') {
  const infoData: CreateErrorLogData = {
    level: 'info',
    source,
    message,
    context,
    request_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  console.info('Info logged:', infoData);
  
  supabase
    .from('error_logs')
    .insert(infoData)
    .then(({ error }) => {
      if (error) console.error('Failed to log info:', error);
    });
}