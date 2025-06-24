import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Generic hook for Supabase queries
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
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Generic hook for Supabase mutations
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
    mutationFn,
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
        toast.error(options?.errorMessage || error.message || 'Une erreur est survenue');
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

// Helper to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST301') {
    return 'Accès refusé. Permissions insuffisantes.';
  }
  
  if (error?.code === 'PGRST116') {
    return 'Aucun résultat trouvé.';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Une erreur inattendue est survenue.';
}