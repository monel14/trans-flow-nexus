import { useSupabaseQuery, useSupabaseMutation } from './useSupabase';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  source: 'api' | 'database' | 'frontend' | 'system';
  message: string;
  stack_trace?: string;
  context?: any;
  user_id?: string;
  user_name?: string;
  request_url?: string;
  request_method?: string;
  response_status?: number;
  created_at: string;
}

export interface ErrorLogFilters {
  level?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  limit?: number;
}

// Hook to get error logs with filters
export function useErrorLogs(filters?: ErrorLogFilters) {
  return useSupabaseQuery(
    ['error-logs', filters],
    async () => {
      let query = supabase
        .from('app_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.level && filters.level !== 'all') {
        query = query.eq('action', filters.level); // Assuming 'action' field stores log level
      }
      
      if (filters?.source && filters.source !== 'all') {
        query = query.eq('table_name', filters.source); // Assuming 'table_name' stores source
      }
      
      if (filters?.search) {
        query = query.ilike('details', `%${filters.search}%`);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(1000); // Default limit
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform audit log data to error log format
      const errorLogs: ErrorLog[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.created_at,
        level: log.action === 'error' ? 'error' : 
               log.action === 'warning' ? 'warning' : 
               log.action === 'info' ? 'info' : 'debug',
        source: log.table_name === 'api' ? 'api' :
                log.table_name === 'database' ? 'database' :
                log.table_name === 'frontend' ? 'frontend' : 'system',
        message: log.details || 'No message',
        stack_trace: log.new_values?.stack_trace,
        context: log.new_values,
        user_id: log.user_id,
        user_name: log.old_values?.user_name,
        request_url: log.new_values?.request_url,
        request_method: log.new_values?.request_method,
        response_status: log.new_values?.response_status,
        created_at: log.created_at,
      }));
      
      return errorLogs;
    }
  );
}

// Hook to create an error log entry
export function useCreateErrorLog() {
  return useSupabaseMutation<ErrorLog, {
    level: 'error' | 'warning' | 'info' | 'debug';
    source: 'api' | 'database' | 'frontend' | 'system';
    message: string;
    stack_trace?: string;
    context?: any;
    request_url?: string;
    request_method?: string;
    response_status?: number;
  }>(
    async (logData) => {
      const { data, error } = await supabase
        .from('app_audit_log')
        .insert({
          table_name: logData.source,
          action: logData.level,
          details: logData.message,
          new_values: {
            stack_trace: logData.stack_trace,
            context: logData.context,
            request_url: logData.request_url,
            request_method: logData.request_method,
            response_status: logData.response_status,
          },
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform back to ErrorLog format
      const errorLog: ErrorLog = {
        id: data.id,
        timestamp: data.created_at,
        level: logData.level,
        source: logData.source,
        message: logData.message,
        stack_trace: logData.stack_trace,
        context: logData.context,
        user_id: data.user_id,
        request_url: logData.request_url,
        request_method: logData.request_method,
        response_status: logData.response_status,
        created_at: data.created_at,
      };
      
      return errorLog;
    },
    {
      invalidateQueries: [['error-logs']],
      successMessage: 'Log d\'erreur créé',
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
  }>(
    async (clearOptions) => {
      let query = supabase
        .from('app_audit_log')
        .delete();
      
      if (clearOptions.beforeDate) {
        query = query.lte('created_at', clearOptions.beforeDate);
      }
      
      if (clearOptions.level) {
        query = query.eq('action', clearOptions.level);
      }
      
      if (clearOptions.source) {
        query = query.eq('table_name', clearOptions.source);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      return { success: true };
    },
    {
      invalidateQueries: [['error-logs']],
      successMessage: 'Logs supprimés',
      errorMessage: 'Erreur lors de la suppression',
    }
  );
}

// Hook to get error log statistics
export function useErrorLogStats() {
  return useSupabaseQuery(
    ['error-log-stats'],
    async () => {
      const { data, error } = await supabase
        .from('app_audit_log')
        .select('action, created_at');
      
      if (error) throw error;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: data?.length || 0,
        errors: data?.filter(log => log.action === 'error').length || 0,
        warnings: data?.filter(log => log.action === 'warning').length || 0,
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
  source: 'api' | 'database' | 'frontend' | 'system' = 'frontend'
) {
  // This would typically be called from error boundaries or catch blocks
  const errorData = {
    level: 'error' as const,
    source,
    message,
    stack_trace: error?.stack,
    context: {
      ...context,
      error_name: error?.name,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
    },
    request_url: window.location.href,
    request_method: 'GET', // Default, would be detected in actual implementation
  };
  
  // In a real implementation, this would send the log to the server
  console.error('Error logged:', errorData);
  
  // Could also send to external logging service like Sentry
}