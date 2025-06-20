
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeveloperMetrics } from '@/hooks/useDeveloperMetrics';
import { 
  Server, 
  Activity, 
  AlertCircle, 
  Code, 
  Database,
  Settings,
  Bug,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { metrics } = useDeveloperMetrics();

  const quickActions = [
    {
      label: 'Types d\'Opérations',
      icon: Settings,
      onClick: () => navigate('/operation-types'),
      variant: 'default' as const
    },
    {
      label: 'Configuration Système',
      icon: Database,
      onClick: () => navigate('/system-config'),
      variant: 'secondary' as const
    },
    {
      label: 'Journaux d\'Erreurs',
      icon: Bug,
      onClick: () => navigate('/error-logs'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord - Développeur
        </h1>
        <p className="text-gray-600">Monitoring technique et configuration système</p>
      </div>

      {/* Métriques système */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Performance API"
          value="99.92%"
          icon={Zap}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle="Temps de réponse moyen"
        />
        <MetricCard
          title="Erreurs Récentes"
          value={metrics?.errorCount || 3}
          icon={AlertCircle}
          iconColor="text-red-500"
          valueColor="text-red-600"
          subtitle="Dernières 24h"
        />
        <MetricCard
          title="Uptime Système"
          value="99.99%"
          icon={Server}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="30 derniers jours"
        />
        <MetricCard
          title="Types d'Opérations"
          value={metrics?.operationTypesCount || 8}
          icon={Code}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="Actifs"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Outils Développeur" />

      {/* Monitoring technique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Charge Serveurs</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Métriques serveurs en temps réel</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Temps de Réponse API</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Performance API</p>
          </div>
        </div>
      </div>

      {/* État du système */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">État des Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium text-green-900">Base de Données</span>
            </div>
            <span className="text-green-600 text-sm">Opérationnel</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium text-green-900">API Services</span>
            </div>
            <span className="text-green-600 text-sm">Opérationnel</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="font-medium text-yellow-900">Cache Redis</span>
            </div>
            <span className="text-yellow-600 text-sm">Dégradé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
