
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/hooks/useErrorLogs';

// Generic hook for Supabase queries with automatic error logging
export function useSupabaseQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        // Log automatiquement les erreurs de requête
        logError(
          'error',
          'database',
          `Query error: ${key.join('/')}`,
          error as Error,
          {
            queryKey: key,
            queryOptions: options,
          }
        );
        throw error;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Generic hook for Supabase mutations with automatic error logging
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        // Log automatiquement les erreurs de mutation
        logError(
          'error',
          'database',
          `Mutation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error as Error,
          {
            variables,
            mutationOptions: options,
          }
        );
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Show success toast
      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Opération réussie');
      }
      
      // Custom success handler
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Show error toast
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || handleSupabaseError(error) || 'Une erreur est survenue');
      }
      
      // Custom error handler
      options?.onError?.(error, variables);
    },
  });
}

// Helper to get authenticated headers
export function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

// Helper to handle Supabase errors with automatic logging
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  let errorMessage = 'Une erreur inattendue est survenue.';
  
  if (error?.code === 'PGRST301') {
    errorMessage = 'Accès refusé. Permissions insuffisantes.';
  } else if (error?.code === 'PGRST116') {
    errorMessage = 'Aucun résultat trouvé.';
  } else if (error?.code === '23505') {
    errorMessage = 'Cette entrée existe déjà.';
  } else if (error?.code === '23503') {
    errorMessage = 'Violation de contrainte de référence.';
  } else if (error?.code === '42501') {
    errorMessage = 'Permissions insuffisantes pour cette opération.';
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Log l'erreur si c'est une erreur significative
  if (error?.code && error.code !== 'PGRST116') {
    logError(
      'warning',
      'database',
      `Supabase error: ${error.code} - ${errorMessage}`,
      undefined,
      {
        errorCode: error.code,
        errorDetails: error,
        timestamp: new Date().toISOString(),
      }
    );
  }
  
  return errorMessage;
}

// Helper pour instrumenter les Server Actions
export function withErrorInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  actionName: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(
        'error',
        'api',
        `Server Action error: ${actionName}`,
        error as Error,
        {
          actionName,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );
      throw error;
    }
  };
}
