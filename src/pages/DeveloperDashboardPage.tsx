
import React from "react";
import ButtonLink from "@/components/Developer/ButtonLink";
import StatCard from "@/components/Developer/StatCard";
import { useDeveloperMetrics } from "@/hooks/useDeveloperMetrics";

const DeveloperDashboardPage = () => {
  const { data: metrics, isLoading, error } = useDeveloperMetrics();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de Bord Développeur</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white shadow p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de Bord Développeur</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur lors du chargement des métriques système
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'API Opérationnelle';
      case 'degraded':
        return 'API Dégradée';
      case 'down':
        return 'API Indisponible';
      case 'connected':
        return 'Base de données connectée';
      case 'disconnected':
        return 'Base de données déconnectée';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Développeur</h1>

      {/* Accès Rapides */}
      <div className="flex flex-wrap gap-4">
        <ButtonLink to="/operation-types">
          Types d'Opérations
        </ButtonLink>
        <ButtonLink to="/system-config">
          Configuration Système
        </ButtonLink>
        <ButtonLink to="/error-logs">
          Journaux d'Erreurs
        </ButtonLink>
      </div>

      {/* Indicateurs de Santé */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
        <StatCard 
          title="Types d'opération" 
          value={metrics?.totalOperationTypes || 0} 
        />
        <StatCard 
          title="Types actifs" 
          value={metrics?.activeOperationTypes || 0} 
        />
        <StatCard 
          title="Champs configurés" 
          value={metrics?.configuredFields || 0} 
        />
        <StatCard 
          title="Règles commission" 
          value={metrics?.commissionRules || 0} 
        />
      </div>

      {/* Statut du système */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Statut du Système</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics?.systemHealth?.apiStatus || 'down')}`}></div>
                <span className="text-sm">{getStatusText(metrics?.systemHealth?.apiStatus || 'down')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics?.systemHealth?.databaseStatus || 'disconnected')}`}></div>
                <span className="text-sm">{getStatusText(metrics?.systemHealth?.databaseStatus || 'disconnected')}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Uptime: {metrics?.uptimePercentage || 0}%
            </div>
          </div>
          
          {metrics?.systemHealth?.lastChecked && (
            <div className="text-xs text-gray-500">
              Dernière vérification: {new Date(metrics.systemHealth.lastChecked).toLocaleString('fr-FR')}
            </div>
          )}
        </div>
      </div>

      {/* Alertes système */}
      {metrics?.systemHealth?.apiStatus !== 'operational' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Attention:</strong> Le système présente des anomalies. Vérifiez les journaux d'erreurs.
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboardPage;
