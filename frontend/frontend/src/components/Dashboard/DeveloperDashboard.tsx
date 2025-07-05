
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
  Zap,
  Terminal,
  GitBranch,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useDeveloperMetrics();

  const quickActions = [
    {
      label: 'Console Système',
      icon: Terminal,
      onClick: () => console.log('Ouvrir console'),
      variant: 'default' as const
    },
    {
      label: 'Types d\'Opérations',
      icon: Settings,
      onClick: () => navigate('/operation-types'),
      variant: 'secondary' as const
    },
    {
      label: 'Journaux d\'Erreurs',
      icon: Bug,
      onClick: () => navigate('/error-logs'),
      variant: 'outline' as const
    },
    {
      label: 'Config Système',
      icon: Database,
      onClick: () => navigate('/system-config'),
      variant: 'outline' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Centre de Développement - Chargement...
          </h1>
          <p className="text-gray-300">Récupération des métriques techniques...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Développeur */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Code className="mr-3 h-8 w-8" />
          Centre de Développement - TransFlow Nexus
        </h1>
        <p className="text-gray-300">
          Architecture système, monitoring technique et configuration avancée
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <GitBranch className="h-4 w-4 mr-1" />
            Branch: production
          </span>
          <span className="flex items-center">
            <Monitor className="h-4 w-4 mr-1" />
            Build: v2.1.3
          </span>
        </div>
      </div>

      {/* Métriques techniques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="System Uptime"
          value={`${metrics?.uptimePercentage || 99.99}%`}
          icon={Zap}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle="30 derniers jours"
        />
        <MetricCard
          title="Erreurs Critiques"
          value={3}
          icon={AlertCircle}
          iconColor="text-red-500"
          valueColor="text-red-600"
          subtitle="Dernières 24h - ACTION REQUISE"
        />
        <MetricCard
          title="Performance API"
          value="< 150ms"
          icon={Activity}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="Temps de réponse moyen"
        />
        <MetricCard
          title="Modules Actifs"
          value={metrics?.totalOperationTypes || 0}
          icon={Code}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="Types d'opérations configurés"
        />
      </div>

      {/* Actions développeur */}
      <QuickActions actions={quickActions} title="Outils de Développement" />

      {/* Monitoring technique avancé */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture système */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Architecture Système
          </h3>
          <div className="space-y-4">
            {/* Services */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Services Core</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { service: 'API Gateway', status: 'online', load: '76%' },
                  { service: 'Auth Service', status: 'online', load: '23%' },
                  { service: 'Transaction Engine', status: 'online', load: '89%' },
                  { service: 'Notification Service', status: 'degraded', load: '45%' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        service.status === 'online' ? 'bg-green-500' : 
                        service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium">{service.service}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{service.load}</span>
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            parseInt(service.load) > 80 ? 'bg-red-500' :
                            parseInt(service.load) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: service.load }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Base de données */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Base de Données</h4>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">PostgreSQL Cluster</span>
                  <span className="text-green-600 text-sm">Performant</span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  Connexions: 47/100 • Queries/sec: 1,247 • Latence: 2.3ms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Surveillance des erreurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bug className="h-5 w-5 mr-2 text-red-500" />
            Surveillance des Erreurs
          </h3>
          <div className="space-y-4">
            {/* Erreurs récentes */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Erreurs Récentes</h4>
              <div className="space-y-2">
                {[
                  { error: 'Database timeout', count: 3, severity: 'high', time: '2 min' },
                  { error: 'API rate limit exceeded', count: 12, severity: 'medium', time: '15 min' },
                  { error: 'Invalid auth token', count: 5, severity: 'low', time: '1h' }
                ].map((error, index) => (
                  <div key={index} className={`p-2 rounded border ${
                    error.severity === 'high' ? 'bg-red-50 border-red-200' :
                    error.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{error.error}</p>
                        <p className="text-xs text-gray-600">Il y a {error.time}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          error.severity === 'high' ? 'bg-red-100 text-red-800' :
                          error.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {error.count}x
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/error-logs')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Analyser Tous les Logs
            </button>
          </div>
        </div>
      </div>

      {/* Configuration système */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuration & Métriques Système
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{metrics?.totalOperationTypes || 0}</p>
            <p className="text-sm text-blue-700">Types d'opération</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{metrics?.activeOperationTypes || 0}</p>
            <p className="text-sm text-green-700">Types actifs</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{metrics?.configuredFields || 0}</p>
            <p className="text-sm text-purple-700">Champs configurés</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{metrics?.commissionRules || 0}</p>
            <p className="text-sm text-orange-700">Règles commission</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
