
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { useTransactionLedger } from '@/hooks/useTransactionLedger';
import { Wallet, DollarSign, Users, TrendingUp, Plus, AlertTriangle, FileText } from 'lucide-react';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';

const ChefAgenceDashboard = () => {
  const { user } = useAuth();
  const { operations } = useOperations({ initiator_id: user?.id });
  const { ledgerEntries } = useTransactionLedger(user?.id);

  // Calcul des métriques
  const currentBalance = ledgerEntries.length > 0 
    ? ledgerEntries[0].balance_after 
    : 500000;

  const volumeAgenceMois = 2450000;
  const commissionsAgence = 125000;
  const agentsActifs = 8;

  const quickActions = [
    {
      label: 'Nouvelle Opération',
      icon: Plus,
      onClick: () => console.log('Nouvelle opération'),
      variant: 'default' as const
    },
    {
      label: 'Gérer mes Agents',
      icon: Users,
      onClick: () => console.log('Gérer agents'),
      variant: 'secondary' as const
    },
    {
      label: 'Recharges Agents',
      icon: Wallet,
      onClick: () => console.log('Recharges agents'),
      variant: 'outline' as const
    },
    {
      label: 'Demander Recharge Admin',
      icon: AlertTriangle,
      onClick: () => console.log('Demander recharge admin'),
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Mon Solde"
          value={formatAmount(currentBalance)}
          icon={Wallet}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <MetricCard
          title="Volume Agence (Mois)"
          value={formatAmount(volumeAgenceMois)}
          icon={TrendingUp}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
        <MetricCard
          title="Commissions Agence"
          value={formatAmount(commissionsAgence)}
          icon={DollarSign}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <MetricCard
          title="Agents Actifs"
          value={agentsActifs}
          icon={Users}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Actions Rapides" />

      {/* Alertes */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-orange-800">Alertes & Actions Requises</h3>
        </div>
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-orange-900">Demandes de Recharge en Attente</span>
            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">3</span>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors">
            Traiter maintenant
          </button>
        </div>
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Agents</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique des performances</p>
          </div>
        </div>

        <TransactionTable 
          transactions={operations.slice(0, 5)}
          title="Dernières Transactions Agence"
        />
      </div>
    </div>
  );
};

export default ChefAgenceDashboard;
