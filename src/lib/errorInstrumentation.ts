
import { toast } from '@/hooks/use-toast';
import { logError } from '@/hooks/useErrorLogs';

// Wrapper générique pour instrumenter les appels API
export function withApiInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  apiName: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      
      // Log the error
      logError(
        'error',
        'api',
        `API Call failed: ${apiName}`,
        error as Error,
        {
          apiName,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );

      // Show user-friendly toast
      toast({
        title: "Erreur API",
        description: `Une erreur est survenue lors de l'appel à ${apiName}`,
        variant: "destructive",
      });

      throw error;
    }
  };
}

// Wrapper spécialisé pour les erreurs d'API externes
export function withExternalApiInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  serviceName: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(
        'error',
        'external',
        `API Call error: ${serviceName}`,
        error as Error,
        {
          service: serviceName,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );

      toast({
        title: "Service externe indisponible",
        description: `Le service ${serviceName} est temporairement indisponible`,
        variant: "destructive",
      });

      throw error;
    }
  };
}

// Wrapper pour les opérations de base de données
export function withDatabaseInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  tableName: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(
        'error',
        'database',
        `Database operation failed: ${operation} on ${tableName}`,
        error as Error,
        {
          operation,
          table: tableName,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );

      toast({
        title: "Erreur de base de données",
        description: `Impossible d'effectuer l'opération ${operation}`,
        variant: "destructive",
      });

      throw error;
    }
  };
}

// Wrapper spécialisé pour les erreurs de validation
export function withValidationInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  validationContext: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        logError(
          'warning',
          'frontend',
          `Validation error: ${validationContext}`,
          error,
          {
            context: validationContext,
            arguments: args,
            timestamp: new Date().toISOString(),
          }
        );

        toast({
          title: "Erreur de validation",
          description: error.message,
          variant: "destructive",
        });
      } else {
        throw error; // Re-throw non-validation errors
      }
    }
  };
}

// Wrapper pour les opérations de fichiers
export function withFileOperationInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(
        'error',
        'system',
        `File operation error: ${operation}`,
        error as Error,
        {
          operation,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );

      toast({
        title: "Erreur de fichier",
        description: `Impossible d'effectuer l'opération: ${operation}`,
        variant: "destructive",
      });

      throw error;
    }
  };
}

// Wrapper pour les opérations d'authentification
export function withAuthInstrumentation<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  authOperation: string
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(
        'warning',
        'system',
        `Auth operation error: ${authOperation}`,
        error as Error,
        {
          operation: authOperation,
          arguments: args,
          timestamp: new Date().toISOString(),
        }
      );

      toast({
        title: "Erreur d'authentification",
        description: `Problème lors de ${authOperation}`,
        variant: "destructive",
      });

      throw error;
    }
  };
}

// Fonction utilitaire pour capturer les erreurs React
export function captureReactError(
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
) {
  logError(
    'critical',
    'frontend',
    'User creation failed',
    error,
    {
      componentStack: errorInfo.componentStack,
      componentName,
      timestamp: new Date().toISOString(),
      errorBoundary: true,
    }
  );
}

// Hook personnalisé pour capturer les erreurs dans les composants fonctionnels
export function useErrorCapture() {
  return (error: Error, context?: string) => {
    logError(
      'error',
      'frontend',
      `Component error: ${context || 'Unknown context'}`,
      error,
      {
        context,
        timestamp: new Date().toISOString(),
      }
    );
  };
}
