
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logError } from '@/hooks/useErrorLogs';

// Generic Supabase query hook
export function useSupabaseQuery<T = any>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error: any) {
        console.error('Query error:', error);
        logError(
          'error',
          'SupabaseQuery',
          `Query error: ${error.message}`,
          error,
          { queryKey }
        );
        throw error;
      }
    },
    ...options,
  });
}

// Generic Supabase mutation hook
export function useSupabaseMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateQueries?: (string | number)[][];
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error: any) {
        console.error('Mutation error:', error);
        logError(
          'error',
          'SupabaseMutation',
          `Mutation error: ${error.message}`,
          error,
          { variables }
        );
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success message
      if (options?.successMessage) {
        toast({
          title: 'Succès',
          description: options.successMessage,
        });
      }

      // Call custom onSuccess
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: (error: Error, variables) => {
      // Show error message
      const errorMessage = options?.errorMessage || 'Une erreur est survenue';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });

      // Call custom onError
      if (options?.onError) {
        options.onError(error, variables);
      }
    },
  });
}

// Server Action wrapper for better error handling
export async function withServerAction<T>(
  action: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    console.error(`Server Action error${context ? ` in ${context}` : ''}:`, error);
    
    // Log to error system
    logError(
      'error',
      'ServerAction',
      `Server Action error: ${error.message}`,
      error,
      { context }
    );
    
    // Re-throw for caller to handle
    throw error;
  }
}

// Utility to handle Supabase RPC calls with proper typing
export async function callSupabaseRPC(
  functionName: string,
  params?: any,
  context?: string
) {
  try {
    // Type-safe RPC call - only allow known function names
    const validFunctions = [
      'cleanup_old_error_logs',
      'create_admin_user', 
      'create_agent',
      'create_chef_agence',
      'create_sous_admin',
      'get_agent_dashboard_kpis',
      'get_chef_agence_dashboard_kpis',
      'get_chef_agents_performance',
      'get_user_agency_id_secure',
      'get_user_role_name',
      'is_admin',
      'is_admin_general',
      'is_chef_agence',
      'is_developer',
      'log_error',
      'process_commission_transfer_atomic',
      'process_recharge_atomic',
      'user_has_role_secure',
      'validate_operation_atomic'
    ];

    if (!validFunctions.includes(functionName)) {
      throw new Error(`Unknown RPC function: ${functionName}`);
    }

    const { data, error } = await supabase.rpc(functionName as any, params);
    
    if (error) {
      throw new Error(`RPC ${functionName} failed: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`RPC call error for ${functionName}:`, error);
    
    logError(
      'error',
      'SupabaseRPC',
      `RPC call failed for ${functionName}: ${error.message}`,
      error,
      { functionName, params, context }
    );
    
    throw error;
  }
}
