
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { useTransactionLedger } from '@/hooks/useTransactionLedger';
import { Wallet, DollarSign, Coins, Plus, AlertTriangle } from 'lucide-react';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { operations } = useOperations({ initiator_id: user?.id });
  const { ledgerEntries } = useTransactionLedger(user?.id);

  // Calcul des métriques
  const currentBalance = ledgerEntries.length > 0 
    ? ledgerEntries[0].balance_after 
    : 0;

  const monthlyCommissions = ledgerEntries
    .filter(entry => 
      entry.transaction_type === 'commission' &&
      new Date(entry.created_at).getMonth() === new Date().getMonth()
    )
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCommissions = ledgerEntries
    .filter(entry => entry.transaction_type === 'commission')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const quickActions = [
    {
      label: 'Nouvelle Opération',
      icon: Plus,
      onClick: () => navigate('/operations/new'),
      variant: 'default' as const
    },
    {
      label: 'Mes Commissions',
      icon: DollarSign,
      onClick: () => navigate('/commissions'),
      variant: 'secondary' as const
    },
    {
      label: 'Demander Recharge',
      icon: Wallet,
      onClick: () => navigate('/recharge'),
      variant: 'outline' as const
    },
    {
      label: 'Support',
      icon: AlertTriangle,
      onClick: () => navigate('/support'),
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
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Solde Actuel"
          value={formatAmount(currentBalance)}
          icon={Wallet}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <MetricCard
          title="Commissions du Mois"
          value={formatAmount(monthlyCommissions)}
          icon={DollarSign}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
        <MetricCard
          title="Commissions Totales"
          value={formatAmount(totalCommissions)}
          icon={Coins}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} />

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité Récente</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique des opérations</p>
          </div>
        </div>

        <TransactionTable 
          transactions={operations.slice(0, 5)}
          title="Dernières Transactions"
        />
      </div>
    </div>
  );
};

export default AgentDashboard;
