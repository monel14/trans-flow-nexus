
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
  Award
} from 'lucide-react';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';
import { useNavigate } from 'react-router-dom';

const ChefAgenceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: operations = [], isLoading: operationsLoading } = useOperations();
  const { ledgerEntries, isLoading: ledgerLoading } = useTransactionLedger(user?.id);

  // Calculs spécifiques aux chefs d'agence
  const currentBalance = ledgerEntries.length > 0 
    ? ledgerEntries[0].balance_after 
    : 500000;

  const volumeAgenceMois = 2450000;
  const commissionsAgence = 125000;
  const agentsActifs = 8;
  const agentsPerformants = 6; // Agents ayant atteint leurs objectifs

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

  return (
    <div className="space-y-6">
      {/* En-tête Chef d'Agence */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de Bord - Chef d'Agence
        </h1>
        <p className="text-purple-100">
          Gérez votre équipe de {agentsActifs} agents et suivez les performances de l'agence
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Mon Solde"
          value={formatAmount(currentBalance)}
          icon={Wallet}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle="Fonds disponibles pour recharges"
        />
        <MetricCard
          title="Volume Agence (Mois)"
          value={formatAmount(volumeAgenceMois)}
          icon={TrendingUp}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="+12% vs mois dernier"
        />
        <MetricCard
          title="Commissions Agence"
          value={formatAmount(commissionsAgence)}
          icon={DollarSign}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          subtitle="Revenus équipe ce mois"
        />
        <MetricCard
          title="Agents Performants"
          value={`${agentsPerformants}/${agentsActifs}`}
          icon={Award}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="Objectifs atteints"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Gestion d'Équipe" />

      {/* Performance des agents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Performance des Agents Cette Semaine
        </h3>
        <div className="space-y-4">
          {/* Simulation d'agents */}
          {['Agent Kouadio', 'Agent Diabaté', 'Agent Traoré', 'Agent Koné'].map((agent, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full p-1.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{agent}</p>
                  <p className="text-sm text-gray-500">
                    {Math.floor(Math.random() * 20) + 15} opérations cette semaine
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatAmount(Math.floor(Math.random() * 50000) + 100000)}
                </p>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 40) + 60}%
                  </span>
                </div>
              </div>
            </div>
          ))}
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
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">3</span>
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
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">2</span>
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
        transactions={operations.slice(0, 5)}
        title="Dernières Transactions de l'Agence"
      />
    </div>
  );
};

export default ChefAgenceDashboard;
