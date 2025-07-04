
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical';
  source: 'api' | 'database' | 'frontend' | 'system' | 'external';
  message: string;
  stack_trace?: string;
  context?: Record<string, any>;
  user_id?: string;
  user_name?: string;
  request_url?: string;
  request_method?: string;
  response_status?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface ErrorLogFilters {
  level?: string;
  source?: string;
  resolved?: boolean;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateErrorLogParams {
  level: ErrorLog['level'];
  source: ErrorLog['source'];
  message: string;
  stack_trace?: string;
  context?: Record<string, any>;
  request_url?: string;
  request_method?: string;
  response_status?: number;
}

// Hook pour récupérer les logs d'erreur avec filtres
export const useErrorLogs = (filters: ErrorLogFilters = {}, limit: number = 50) => {
  return useQuery({
    queryKey: ['error-logs', filters, limit],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Appliquer les filtres
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as ErrorLog[]) || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook pour créer un log d'erreur
export const useCreateErrorLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateErrorLogParams) => {
      const { data, error } = await supabase.rpc('log_error', {
        p_level: params.level,
        p_source: params.source,
        p_message: params.message,
        p_stack_trace: params.stack_trace || null,
        p_context: params.context || {},
        p_request_url: params.request_url || null,
        p_request_method: params.request_method || null,
        p_response_status: params.response_status || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
    },
  });
};

// Hook pour marquer un log comme résolu
export const useResolveErrorLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      logId, 
      resolutionNotes 
    }: { 
      logId: string; 
      resolutionNotes?: string; 
    }) => {
      const { data, error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
        })
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast({
        title: "Log résolu",
        description: "Le log d'erreur a été marqué comme résolu",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer le log comme résolu",
        variant: "destructive",
      });
    },
  });
};

// Hook pour supprimer un log d'erreur
export const useDeleteErrorLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('error_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast({
        title: "Log supprimé",
        description: "Le log d'erreur a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le log d'erreur",
        variant: "destructive",
      });
    },
  });
};

// Hook pour nettoyer les anciens logs
export const useCleanupOldLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('cleanup_old_error_logs');
      if (error) throw error;
      return data;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast({
        title: "Nettoyage terminé",
        description: `${deletedCount} anciens logs ont été supprimés`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur de nettoyage",
        description: "Impossible de nettoyer les anciens logs",
        variant: "destructive",
      });
    },
  });
};

// Hook pour les statistiques des logs d'erreur
export const useErrorLogsStats = () => {
  return useQuery({
    queryKey: ['error-logs-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('level, source, resolved, created_at');

      if (error) throw error;
      
      const logs = data || [];
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const stats = {
        total: logs.length,
        by_level: logs.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        by_source: logs.reduce((acc, log) => {
          acc[log.source] = (acc[log.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        resolved: logs.filter(log => log.resolved).length,
        unresolved: logs.filter(log => !log.resolved).length,
        today: logs.filter(log => 
          new Date(log.created_at).toDateString() === today.toDateString()
        ).length,
        yesterday: logs.filter(log => 
          new Date(log.created_at).toDateString() === yesterday.toDateString()
        ).length,
      };

      return stats;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Fonction utilitaire pour logger des erreurs depuis le frontend
export const logError = async (
  level: ErrorLog['level'],
  source: ErrorLog['source'],
  message: string,
  error?: Error,
  context?: Record<string, any>
) => {
  try {
    const params: CreateErrorLogParams = {
      level,
      source,
      message,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    if (error) {
      params.stack_trace = error.stack;
      params.context = {
        ...params.context,
        error_name: error.name,
        error_message: error.message,
      };
    }

    const { error: logError } = await supabase.rpc('log_error', {
      p_level: params.level,
      p_source: params.source,
      p_message: params.message,
      p_stack_trace: params.stack_trace || null,
      p_context: params.context || {},
      p_request_url: window.location.href,
      p_request_method: 'GET',
      p_response_status: null,
    });

    if (logError) {
      console.error('Failed to log error:', logError);
    }
  } catch (err) {
    console.error('Error logging error:', err);
  }
};
