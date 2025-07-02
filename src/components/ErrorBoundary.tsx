import React, { Component, ReactNode } from 'react';
import { logError } from '@/hooks/useErrorLogs';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Composant Error Boundary pour capturer automatiquement les erreurs React
 * et les enregistrer dans les logs d'erreurs
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Met à jour le state pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur dans notre système de logs
    logError(
      `React Error Boundary: ${error.message}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        timestamp: new Date().toISOString(),
      },
      'frontend'
    );

    // Mettre à jour le state avec les infos de l'erreur
    this.setState({
      error,
      errorInfo,
    });

    // Log également dans la console pour le développement
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }

      // Fallback par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Une erreur est survenue
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Une erreur inattendue s'est produite. L'équipe technique a été automatiquement notifiée.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="text-sm font-medium text-red-800 mb-2">Détails de l'erreur (développement):</h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Recharger la page
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour instrumenter les fonctions async avec gestion d'erreur automatique
 */
export function useErrorHandler() {
  const handleError = React.useCallback((
    error: Error,
    context?: any,
    source: 'api' | 'database' | 'frontend' | 'system' | 'external' = 'frontend'
  ) => {
    logError(error.message, error, context, source);
  }, []);

  /**
   * Wrapper pour instrumenter automatiquement les fonctions async
   */
  const withErrorHandling = React.useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: any,
    source: 'api' | 'database' | 'frontend' | 'system' | 'external' = 'frontend'
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error as Error, context, source);
        throw error; // Re-throw pour que l'appelant puisse également gérer l'erreur
      }
    };
  }, [handleError]);

  return { handleError, withErrorHandling };
}

/**
 * HOC pour wrapper automatiquement un composant avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;