/**
 * Script d'instrumentation pour ajouter des logs d'erreurs 
 * dans les fonctions critiques existantes
 */

import { logError, logWarning, logInfo } from '@/hooks/useErrorLogs';

// Exemple d'instrumentation pour une Server Action ou fonction API
export const instrumentedApiCall = async (endpoint: string, data: any) => {
  try {
    logInfo(`API Call started: ${endpoint}`, { endpoint, data }, 'api');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      logError(
        `API Call failed: ${endpoint}`, 
        new Error(`HTTP ${response.status}: ${errorData}`),
        {
          endpoint,
          requestData: data,
          responseStatus: response.status,
          responseData: errorData
        },
        'api'
      );
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const result = await response.json();
    logInfo(`API Call successful: ${endpoint}`, { endpoint, resultSize: JSON.stringify(result).length }, 'api');
    
    return result;
    
  } catch (error) {
    logError(
      `API Call error: ${endpoint}`,
      error as Error,
      {
        endpoint,
        requestData: data,
        errorType: 'network_error'
      },
      'api'
    );
    throw error;
  }
};

// Exemple d'instrumentation pour une opération Supabase
export const instrumentedSupabaseOperation = async (operation: string, tableName: string, queryFn: () => Promise<any>) => {
  try {
    logInfo(`Database operation started: ${operation} on ${tableName}`, { operation, tableName }, 'database');
    
    const result = await queryFn();
    
    if (result.error) {
      logError(
        `Database operation failed: ${operation} on ${tableName}`,
        new Error(result.error.message),
        {
          operation,
          tableName,
          errorCode: result.error.code,
          errorDetails: result.error
        },
        'database'
      );
      throw result.error;
    }
    
    logInfo(`Database operation successful: ${operation} on ${tableName}`, { 
      operation, 
      tableName, 
      resultCount: Array.isArray(result.data) ? result.data.length : 1 
    }, 'database');
    
    return result;
    
  } catch (error) {
    logError(
      `Database operation error: ${operation} on ${tableName}`,
      error as Error,
      {
        operation,
        tableName,
        errorType: 'database_error'
      },
      'database'
    );
    throw error;
  }
};

// Exemple d'instrumentation pour les opérations de validation
export const instrumentedValidation = (validationName: string, data: any, validationFn: () => any) => {
  try {
    logInfo(`Validation started: ${validationName}`, { validationName, dataKeys: Object.keys(data) }, 'system');
    
    const result = validationFn();
    
    logInfo(`Validation successful: ${validationName}`, { validationName }, 'system');
    
    return result;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logWarning(
        `Validation failed: ${validationName}`,
        {
          validationName,
          validationErrors: (error as any).errors,
          inputData: data
        },
        'system'
      );
    } else {
      logError(
        `Validation error: ${validationName}`,
        error as Error,
        {
          validationName,
          inputData: data,
          errorType: 'validation_error'
        },
        'system'
      );
    }
    throw error;
  }
};

// Exemple d'instrumentation pour les opérations de fichiers
export const instrumentedFileOperation = async (operation: string, filename: string, operationFn: () => Promise<any>) => {
  try {
    logInfo(`File operation started: ${operation}`, { operation, filename }, 'system');
    
    const result = await operationFn();
    
    logInfo(`File operation successful: ${operation}`, { 
      operation, 
      filename,
      resultSize: typeof result === 'string' ? result.length : JSON.stringify(result).length
    }, 'system');
    
    return result;
    
  } catch (error) {
    logError(
      `File operation error: ${operation}`,
      error as Error,
      {
        operation,
        filename,
        errorType: 'file_error'
      },
      'system'
    );
    throw error;
  }
};

// Exemple d'instrumentation pour les authentifications
export const instrumentedAuthOperation = async (operation: string, operationFn: () => Promise<any>) => {
  try {
    logInfo(`Auth operation started: ${operation}`, { operation }, 'system');
    
    const result = await operationFn();
    
    if (result.error) {
      logWarning(
        `Auth operation failed: ${operation}`,
        {
          operation,
          errorCode: result.error.code,
          errorMessage: result.error.message
        },
        'system'
      );
    } else {
      logInfo(`Auth operation successful: ${operation}`, { operation }, 'system');
    }
    
    return result;
    
  } catch (error) {
    logError(
      `Auth operation error: ${operation}`,
      error as Error,
      {
        operation,
        errorType: 'auth_error'
      },
      'system'
    );
    throw error;
  }
};

// Exemple d'utilisation dans un composant React
export const ExampleUsageInComponent = () => {
  const handleSubmit = async (formData: any) => {
    try {
      // Instrumentation de la validation
      const validatedData = instrumentedValidation('userFormValidation', formData, () => {
        // Ici votre logique de validation Zod
        return formData; // ou votre schéma.parse(formData)
      });
      
      // Instrumentation de l'appel API
      const result = await instrumentedApiCall('/api/users', validatedData);
      
      // Instrumentation de l'opération Supabase
      const dbResult = await instrumentedSupabaseOperation('insert', 'users', async () => {
        // Ici votre appel Supabase
        return { data: result, error: null };
      });
      
      logInfo('User creation completed successfully', { userId: result.id }, 'frontend');
      
    } catch (error) {
      logError(
        'User creation failed',
        error as Error,
        {
          formData,
          step: 'form_submission',
          componentName: 'ExampleUsageInComponent'
        },
        'frontend'
      );
    }
  };
  
  return null; // Votre JSX ici
};

export default {
  instrumentedApiCall,
  instrumentedSupabaseOperation,
  instrumentedValidation,
  instrumentedFileOperation,
  instrumentedAuthOperation,
  ExampleUsageInComponent
};