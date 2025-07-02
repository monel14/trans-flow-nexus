
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

  // Calculs spécifiques aux agents
  const currentBalance = ledgerEntries.length > 0 
    ? ledgerEntries[0].balance_after 
    : user?.balance || 0;

  const todayOperations = operations.filter(op => 
    new Date(op.created_at).toDateString() === new Date().toDateString()
  );

  const thisWeekCommissions = 45000; // Exemple
  const monthlyTarget = 500000; // Exemple
  const monthlyProgress = (todayOperations.length * 50000 / monthlyTarget) * 100;

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

  return (
    <div className="space-y-6">
      {/* En-tête personnalisé pour agent */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour {user?.name} ! 👋
        </h1>
        <p className="text-blue-100">
          Prêt à traiter vos opérations aujourd'hui ? Vous avez {todayOperations.length} opérations en cours.
        </p>
      </div>

      {/* Métriques agent */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Mon Solde Actuel"
          value={formatAmount(currentBalance)}
          icon={Wallet}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle={currentBalance < 100000 ? "⚠️ Solde faible" : "✅ Solde suffisant"}
        />
        <MetricCard
          title="Opérations Aujourd'hui"
          value={todayOperations.length}
          icon={Clock}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle={`+${todayOperations.filter(op => op.status === 'completed').length} complétées`}
        />
        <MetricCard
          title="Commissions Cette Semaine"
          value={formatAmount(thisWeekCommissions)}
          icon={DollarSign}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          subtitle="Prochaine paie: Vendredi"
        />
        <MetricCard
          title="Objectif Mensuel"
          value={`${Math.round(monthlyProgress)}%`}
          icon={Target}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle={`${formatAmount(monthlyTarget - (monthlyProgress * monthlyTarget / 100))} restant`}
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Que souhaitez-vous faire ?" />

      {/* Alerte solde faible */}
      {currentBalance < 100000 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-800">Attention - Solde Faible</h3>
          </div>
          <p className="text-orange-700 mb-4">
            Votre solde actuel est de {formatAmount(currentBalance)}. 
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
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Objectif: {formatAmount(monthlyTarget)}</span>
            <span>{Math.round(monthlyProgress)}% atteint</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{todayOperations.filter(op => op.status === 'completed').length}</p>
              <p className="text-sm text-gray-600">Réussies aujourd'hui</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{todayOperations.filter(op => op.status === 'pending').length}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{formatAmount(thisWeekCommissions)}</p>
              <p className="text-sm text-gray-600">Commissions semaine</p>
            </div>
          </div>
        </div>
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
