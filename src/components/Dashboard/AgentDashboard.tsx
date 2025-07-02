
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { useTransactionLedger } from '@/hooks/useTransactionLedger';
import { 
  Wallet, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Plus, 
  History,
  AlertCircle,
  Target,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';
import { useAgentDashboardKPIs } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: operations = [], isLoading: operationsLoading } = useOperations();
  const { ledgerEntries, isLoading: ledgerLoading } = useTransactionLedger(user?.id);
  
  // Récupération des données dynamiques via les nouvelles fonctions RPC
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useAgentDashboardKPIs();

  // Filtrer les opérations d'aujourd'hui
  const todayOperations = operations.filter(op => 
    new Date(op.created_at).toDateString() === new Date().toDateString()
  );

  const quickActions = [
    {
      label: 'Nouvelle Opération',
      icon: Plus,
      onClick: () => navigate('/operations/new'),
      variant: 'default' as const
    },
    {
      label: 'Mes Opérations',
      icon: History,
      onClick: () => navigate('/operations/history'),
      variant: 'secondary' as const
    },
    {
      label: 'Demande de Recharge',
      icon: Wallet,
      onClick: () => navigate('/recharge'),
      variant: 'outline' as const
    },
    {
      label: 'Mes Commissions',
      icon: DollarSign,
      onClick: () => navigate('/commissions'),
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bonjour {user?.name} ! 👋
          </h1>
          <p className="text-blue-100">
            Une erreur s'est produite lors du chargement de vos données
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Erreur de Chargement</h3>
          </div>
          <p className="text-red-700 mb-4">
            Impossible de charger vos données personnelles. Veuillez réessayer.
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
      {/* En-tête personnalisé pour agent */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour {user?.name} ! 👋
        </h1>
        <p className="text-blue-100">
          Prêt à traiter vos opérations aujourd'hui ? Vous avez {kpis?.operations_today?.total || todayOperations.length} opérations en cours.
        </p>
      </div>

      {/* Métriques agent */}
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
              title="Mon Solde Actuel"
              value={kpis?.agent_balance?.formatted || '0 XOF'}
              icon={Wallet}
              iconColor={kpis?.agent_balance?.status === 'good' ? "text-green-500" : 
                       kpis?.agent_balance?.status === 'medium' ? "text-orange-500" : "text-red-500"}
              valueColor={kpis?.agent_balance?.status === 'good' ? "text-green-600" : 
                        kpis?.agent_balance?.status === 'medium' ? "text-orange-600" : "text-red-600"}
              subtitle={kpis?.agent_balance?.subtitle || 'Solde disponible'}
            />
            <MetricCard
              title="Opérations Aujourd'hui"
              value={kpis?.operations_today?.total?.toString() || '0'}
              icon={Clock}
              iconColor="text-blue-500"
              valueColor="text-blue-600"
              subtitle={kpis?.operations_today?.subtitle || 'Activité du jour'}
            />
            <MetricCard
              title="Commissions Cette Semaine"
              value={kpis?.commissions_week?.formatted || '0 XOF'}
              icon={DollarSign}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              subtitle={kpis?.commissions_week?.subtitle || 'Gains de la semaine'}
            />
            <MetricCard
              title="Objectif Mensuel"
              value={kpis?.monthly_objective?.progress_formatted || '0%'}
              icon={Target}
              iconColor="text-purple-500"
              valueColor="text-purple-600"
              subtitle={kpis?.monthly_objective?.remaining_formatted || 'Objectif en cours'}
            />
          </>
        )}
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Que souhaitez-vous faire ?" />

      {/* Alerte solde faible */}
      {!kpisLoading && kpis?.agent_balance?.status && ['critical', 'low'].includes(kpis.agent_balance.status) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-800">Attention - Solde Faible</h3>
          </div>
          <p className="text-orange-700 mb-4">
            Votre solde actuel est de {kpis.agent_balance.formatted}. 
            Il est recommandé de faire une demande de recharge pour continuer vos opérations.
          </p>
          <button 
            onClick={() => navigate('/recharge')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Demander une Recharge
          </button>
        </div>
      )}

      {/* Progression de l'objectif */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progression de l'Objectif Mensuel</h3>
        {kpisLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Objectif: {kpis?.monthly_objective?.target_formatted || '500 000 XOF'}</span>
              <span>{kpis?.monthly_objective?.progress_formatted || '0%'} atteint</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(kpis?.monthly_objective?.progress_percentage || 0, 100)}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{kpis?.operations_today?.completed || 0}</p>
                <p className="text-sm text-gray-600">Réussies aujourd'hui</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{kpis?.operations_today?.pending || 0}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{kpis?.commissions_week?.formatted || '0 XOF'}</p>
                <p className="text-sm text-gray-600">Commissions semaine</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mes dernières opérations */}
      <TransactionTable 
        transactions={operations.slice(0, 5)}
        title="Mes Dernières Opérations"
      />
    </div>
  );
};

export default AgentDashboard;
