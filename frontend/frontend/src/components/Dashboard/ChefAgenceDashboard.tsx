
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { useTransactionLedger } from '@/hooks/useTransactionLedger';
import { 
  Wallet, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  AlertTriangle, 
  UserCheck,
  BarChart3,
  Award,
  Loader2
} from 'lucide-react';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';
import { useNavigate } from 'react-router-dom';
import { useChefAgenceDashboardKPIs, useChefAgentsPerformance } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const ChefAgenceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: operations = [], isLoading: operationsLoading } = useOperations();
  const { ledgerEntries, isLoading: ledgerLoading } = useTransactionLedger(user?.id);
  
  // Récupération des données dynamiques via les nouvelles fonctions RPC
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useChefAgenceDashboardKPIs();
  const { data: agentsPerformance = [], isLoading: agentsLoading } = useChefAgentsPerformance(4);

  const quickActions = [
    {
      label: 'Gérer mes Agents',
      icon: Users,
      onClick: () => navigate('/agents'),
      variant: 'default' as const
    },
    {
      label: 'Recharges Agents',
      icon: Wallet,
      onClick: () => navigate('/agent-recharges'),
      variant: 'secondary' as const
    },
    {
      label: 'Nouvelle Opération',
      icon: Plus,
      onClick: () => navigate('/operations/new'),
      variant: 'outline' as const
    },
    {
      label: 'Rapport Performance',
      icon: BarChart3,
      onClick: () => console.log('Rapport Performance'),
      variant: 'outline' as const
    }
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(amount) + ' XOF';
  };

  // Gestion des erreurs
  if (kpisError) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Tableau de Bord - Chef d'Agence
          </h1>
          <p className="text-purple-100">
            Une erreur s'est produite lors du chargement des données
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Erreur de Chargement</h3>
          </div>
          <p className="text-red-700 mb-4">
            Impossible de charger les données de votre agence. Veuillez réessayer.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Chef d'Agence */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de Bord - Chef d'Agence
        </h1>
        <p className="text-purple-100">
          Gérez votre équipe de {kpis?.agents_performance?.total_agents || 0} agents et suivez les performances de l'agence
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpisLoading ? (
          // Skeletons pendant le chargement
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Mon Solde"
              value={kpis?.chef_balance?.formatted || '0 XOF'}
              icon={Wallet}
              iconColor={kpis?.chef_balance?.status === 'good' ? "text-green-500" : 
                       kpis?.chef_balance?.status === 'medium' ? "text-orange-500" : "text-red-500"}
              valueColor={kpis?.chef_balance?.status === 'good' ? "text-green-600" : 
                        kpis?.chef_balance?.status === 'medium' ? "text-orange-600" : "text-red-600"}
              subtitle={kpis?.chef_balance?.subtitle || 'Fonds disponibles'}
            />
            <MetricCard
              title="Volume Agence (Mois)"
              value={kpis?.agency_volume_month?.formatted || '0 XOF'}
              icon={TrendingUp}
              iconColor="text-blue-500"
              valueColor="text-blue-600"
              subtitle={kpis?.agency_volume_month?.subtitle || 'Volume mensuel'}
            />
            <MetricCard
              title="Commissions Agence"
              value={kpis?.agency_commissions?.formatted || '0 XOF'}
              icon={DollarSign}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              subtitle={kpis?.agency_commissions?.subtitle || 'Revenus équipe'}
            />
            <MetricCard
              title="Agents Performants"
              value={`${kpis?.agents_performance?.performants || 0}/${kpis?.agents_performance?.total_agents || 0}`}
              icon={Award}
              iconColor="text-purple-500"
              valueColor="text-purple-600"
              subtitle={kpis?.agents_performance?.subtitle || 'Performance équipe'}
            />
          </>
        )}
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Gestion d'Équipe" />

      {/* Performance des agents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Performance des Agents Cette Semaine
          {agentsLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </h3>
        <div className="space-y-4">
          {agentsLoading ? (
            // Skeletons pour les agents
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <div className="flex items-center">
                      <Skeleton className="w-16 h-2 mr-2" />
                      <Skeleton className="w-8 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : agentsPerformance && Array.isArray(agentsPerformance) && agentsPerformance.length > 0 ? (
            agentsPerformance.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full p-1.5 mr-3 flex items-center justify-center ${
                    agent.performance_level === 'excellent' ? 'bg-green-100 text-green-600' :
                    agent.performance_level === 'good' ? 'bg-blue-100 text-blue-600' :
                    agent.performance_level === 'average' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{agent.name}</p>
                    <p className="text-sm text-gray-500">
                      {agent.operations_week} opérations cette semaine
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {agent.volume_week_formatted}
                  </p>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          agent.performance_level === 'excellent' ? 'bg-green-500' :
                          agent.performance_level === 'good' ? 'bg-blue-500' :
                          agent.performance_level === 'average' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(agent.success_rate, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {agent.success_rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p>Aucun agent actif cette semaine</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-orange-800">Actions Requises</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-orange-900">Demandes de Recharge</span>
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                {kpisLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (kpis?.pending_actions?.recharge_requests || 0)}
              </span>
            </div>
            <button 
              onClick={() => navigate('/agent-recharges')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors w-full"
            >
              Traiter les demandes
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-orange-900">Agents Inactifs</span>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {kpisLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (kpis?.pending_actions?.inactive_agents || 0)}
              </span>
            </div>
            <button 
              onClick={() => navigate('/agents')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors w-full"
            >
              Voir les agents
            </button>
          </div>
        </div>
      </div>

      {/* Transactions récentes de l'agence */}
      <TransactionTable 
        transactions={(operations || []).slice(0, 5)}
        title="Dernières Transactions de l'Agence"
      />
    </div>
  );
};

export default ChefAgenceDashboard;
