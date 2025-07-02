
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  DollarSign,
  Activity,
  Shield,
  BarChart3,
  Globe,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import { useAdminDashboardKPIs, useTopAgenciesPerformance } from '@/hooks/useDashboard';

const AdminGeneralDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Récupération des données dynamiques
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useAdminDashboardKPIs();
  const { data: topAgencies, isLoading: agenciesLoading } = useTopAgenciesPerformance(3);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(amount) + ' XOF';
  };

  const quickActions = [
    {
      label: 'Supervision Globale',
      icon: Globe,
      onClick: () => console.log('Supervision'),
      variant: 'default' as const
    },
    {
      label: 'Gestion Agences',
      icon: Building,
      onClick: () => navigate('/agencies'),
      variant: 'secondary' as const
    },
    {
      label: 'Validation Urgente',
      icon: CheckCircle,
      onClick: () => navigate('/validation'),
      variant: 'outline' as const
    },
    {
      label: 'Rapports Avancés',
      icon: BarChart3,
      onClick: () => console.log('Rapports'),
      variant: 'outline' as const
    }
  ];

  // Gestion des erreurs
  if (kpisError) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Centre de Contrôle - Administrateur Général
          </h1>
          <p className="text-red-100">
            Une erreur s'est produite lors du chargement des données
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Erreur lors du chargement des KPIs</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Admin */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Centre de Contrôle - Administrateur Général
        </h1>
        <p className="text-red-100">
          Supervision complète du système TransFlow Nexus - {kpis?.network_stats?.active_agencies || 0} agences actives
        </p>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpisLoading ? (
          // Skeletons pendant le chargement
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Volume Total (Aujourd'hui)"
              value={kpis?.volume_today?.formatted || '0 XOF'}
              icon={TrendingUp}
              iconColor="text-green-500"
              valueColor="text-green-600"
              subtitle={kpis?.volume_today?.growth_formatted || '0%'}
            />
            <MetricCard
              title="Opérations Système"
              value={kpis?.operations_system?.total_today?.toString() || '0'}
              icon={Activity}
              iconColor="text-blue-500"
              valueColor="text-blue-600"
              subtitle={kpis?.operations_system?.subtitle || 'Aucune donnée'}
            />
            <MetricCard
              title="Réseau TransFlow"
              value={`${kpis?.network_stats?.active_agencies || 0} Agences`}
              icon={Building}
              iconColor="text-purple-500"
              valueColor="text-purple-600"
              subtitle={kpis?.network_stats?.subtitle || 'Aucune donnée'}
            />
            <MetricCard
              title="Revenus Système"
              value={kpis?.monthly_revenue?.formatted || '0 XOF'}
              icon={DollarSign}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              subtitle={kpis?.monthly_revenue?.subtitle || 'Aucune donnée'}
            />
          </>
        )}
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Centre de Contrôle" />

      {/* Vue d'ensemble du système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Shield className="mr-2 h-5 w-5" />
              État du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-900">Système Principal</span>
                </div>
                <span className="text-green-600 text-sm font-semibold">Opérationnel</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-900">Base de Données</span>
                </div>
                <span className="text-green-600 text-sm font-semibold">99.8% Uptime</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-yellow-900">API Gateway</span>
                </div>
                <span className="text-yellow-600 text-sm font-semibold">Charge élevée</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-blue-900">Monitoring</span>
                </div>
                <span className="text-blue-600 text-sm font-semibold">Surveillance active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <BarChart3 className="mr-2 h-5 w-5" />
              Performance Réseau
              {agenciesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Top 3 Agences (Volume)</span>
              </div>
              
              {agenciesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-6 rounded-full mr-3" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : topAgencies && topAgencies.length > 0 ? (
                topAgencies.map((agence, index) => (
                  <div key={agence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full mr-3">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{agence.name}</span>
                        {agence.city && <span className="text-sm text-gray-500 block">{agence.city}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-purple-600">
                        {formatAmount(agence.volume_month)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {agence.operations_count} ops
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Aucune donnée d'agence disponible</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Croissance réseau</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpis?.volume_today?.growth_formatted || '+0%'}
                  </p>
                  <p className="text-xs text-gray-500">vs hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files d'attente critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Files d'Attente Critiques - Intervention Requise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-900">
                  Transactions Bloquées
                </span>
                <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                  {kpisLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (kpis?.critical_alerts?.blocked_transactions || 0)}
                </span>
              </div>
              <p className="text-xs text-red-700 mb-3">Nécessite validation immédiate</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/validation')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Traiter Maintenant
              </Button>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Requêtes Support Critiques
                </span>
                <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded-full">
                  {kpisLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (kpis?.critical_alerts?.support_requests || 0)}
                </span>
              </div>
              <p className="text-xs text-orange-700 mb-3">Incidents système signalés</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/support')}
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                Examiner
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-900">
                  Agences Sous-Performance
                </span>
                <span className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">
                  {kpisLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (kpis?.critical_alerts?.underperforming_agencies || 0)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">Volume en baisse significative</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/agencies')}
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Analyser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGeneralDashboard;
