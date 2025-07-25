
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical';
  source: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  user_name?: string;
  timestamp: string;
  context?: any;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  request_url?: string;
  request_method?: string;
  response_status?: number;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface ErrorLogStats {
  total_errors: number;
  critical_errors: number;
  unresolved_errors: number;
  errors_today: number;
  most_common_sources: Array<{
    source: string;
    count: number;
  }>;
}

// Hook to get error logs with filtering
export function useErrorLogs(filters?: {
  level?: string;
  source?: string;
  resolved?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['error-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.level) {
        query = query.eq('level', filters.level);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Mapper les données vers notre interface
      return (data || []).map(log => ({
        ...log,
        id: log.id.toString(), // Convertir number en string
      })) as ErrorLog[];
    }
  });
}

// Hook to get error log statistics
export function useErrorLogsStats() {
  return useQuery({
    queryKey: ['error-logs-stats'],
    queryFn: async () => {
      // Get basic stats
      const { data: stats, error: statsError } = await supabase
        .from('error_logs')
        .select('level, source, resolved, created_at')
        .order('created_at', { ascending: false });

      if (statsError) throw statsError;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const total_errors = stats?.length || 0;
      const critical_errors = stats?.filter(log => log.level === 'critical').length || 0;
      const unresolved_errors = stats?.filter(log => !log.resolved).length || 0;
      const errors_today = stats?.filter(log => 
        new Date(log.created_at) >= today
      ).length || 0;

      // Calculate most common sources
      const sourceCounts: { [key: string]: number } = {};
      stats?.forEach(log => {
        sourceCounts[log.source] = (sourceCounts[log.source] || 0) + 1;
      });

      const most_common_sources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_errors,
        critical_errors,
        unresolved_errors,
        errors_today,
        most_common_sources,
      } as ErrorLogStats;
    }
  });
}

// Hook to resolve an error log
export function useResolveErrorLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, resolution_notes }: {
      logId: string;
      resolution_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes,
        })
        .eq('id', parseInt(logId)) // Convertir string en number
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['error-logs-stats'] });
    },
  });
}

// Hook to clear old error logs
export function useClearErrorLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ olderThanDays }: {
      olderThanDays: number;
    }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await supabase
        .from('error_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['error-logs-stats'] });
    },
  });
}

// Hook to bulk resolve error logs
export function useBulkResolveErrorLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logIds, resolution_notes }: {
      logIds: string[];
      resolution_notes?: string;
    }) => {
      const numericIds = logIds.map(id => parseInt(id)); // Convertir strings en numbers
      
      const { data, error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes,
        })
        .in('id', numericIds);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['error-logs-stats'] });
    },
  });
}

// Fonction utilitaire pour logger des erreurs
export function logError(
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical',
  source: string,
  message: string,
  error?: Error,
  context?: any
) {
  // Log vers la console en développement
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${level.toUpperCase()}] ${source}: ${message}`, error, context);
  }

  // Envoyer vers Supabase (asynchrone, sans bloquer)
  supabase
    .from('error_logs')
    .insert({
      level,
      source,
      message,
      stack_trace: error?.stack,
      context: context || {},
      timestamp: new Date().toISOString(),
    })
    .then(({ error: insertError }) => {
      if (insertError) {
        console.error('Failed to log error to Supabase:', insertError);
      }
    });
}

// Export additional utility functions
export function logWarning(source: string, message: string, context?: any) {
  logError('warning', source, message, undefined, context);
}

export function logInfo(source: string, message: string, context?: any) {
  logError('info', source, message, undefined, context);
}
