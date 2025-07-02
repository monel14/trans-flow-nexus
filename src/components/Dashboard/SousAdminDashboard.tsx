
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  FileText, 
  Clock, 
  AlertTriangle,
  Users,
  MessageSquare,
  Zap,
  Headphones,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';
import { useSousAdminDashboardKPIs, useRecentOperations } from '@/hooks/useDashboard';

const SousAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: operations = [], isLoading: operationsLoading } = useOperations();

  const pendingTransactions = operations.filter(op => op.status === 'pending').length;
  const completedToday = operations.filter(op => 
    op.status === 'completed' && 
    new Date(op.created_at).toDateString() === new Date().toDateString()
  ).length;

  const quickActions = [
    {
      label: 'Validation Express',
      icon: Zap,
      onClick: () => navigate('/validation'),
      variant: 'default' as const
    },
    {
      label: 'Support Utilisateurs',
      icon: Headphones,
      onClick: () => navigate('/support'),
      variant: 'secondary' as const
    },
    {
      label: 'Tickets Assignés',
      icon: MessageSquare,
      onClick: () => console.log('Mes tickets'),
      variant: 'outline' as const
    },
    {
      label: 'Assistance Agents',
      icon: Users,
      onClick: () => console.log('Assistance'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête Sous-Admin */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bureau d'Assistance - Sous-Administrateur
        </h1>
        <p className="text-indigo-100">
          Support opérationnel et validation des transactions - {user?.name}
        </p>
      </div>

      {/* Métriques d'assistance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="À Valider (Urgent)"
          value={pendingTransactions}
          icon={AlertTriangle}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          subtitle="Attente de validation"
        />
        <MetricCard
          title="Validées Aujourd'hui"
          value={completedToday}
          icon={CheckCircle}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle="Traitées avec succès"
        />
        <MetricCard
          title="Tickets Support"
          value="12"
          icon={MessageSquare}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="5 nouveaux, 7 en cours"
        />
        <MetricCard
          title="Temps Moyen"
          value="3.2 min"
          icon={Clock}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="Traitement par transaction"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Centre d'Assistance" />

      {/* Zone de travail prioritaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validations prioritaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-500" />
            Validations Prioritaires
          </h3>
          <div className="space-y-3">
            {[
              { type: 'Transfert International', amount: '2,450,000', urgent: true },
              { type: 'Recharge Agence', amount: '850,000', urgent: false },
              { type: 'Paiement Facture', amount: '125,000', urgent: true },
              { type: 'Mobile Money', amount: '75,000', urgent: false }
            ].map((transaction, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                transaction.urgent 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{transaction.amount} XOF</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {transaction.urgent && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        URGENT
                      </span>
                    )}
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/validation')}
            className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voir Toutes les Validations
          </button>
        </div>

        {/* Support & Assistance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Headphones className="h-5 w-5 mr-2 text-blue-500" />
            Support & Assistance
          </h3>
          <div className="space-y-4">
            {/* Statistiques de support */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">8</p>
                <p className="text-sm text-blue-700">Tickets ouverts</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">24</p>
                <p className="text-sm text-green-700">Résolus cette semaine</p>
              </div>
            </div>

            {/* Tickets récents */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Tickets Récents</h4>
              {[
                { user: 'Agent Kouadio', issue: 'Problème de connexion', priority: 'high' },
                { user: 'Chef Diabaté', issue: 'Recharge bloquée', priority: 'medium' },
                { user: 'Agent Traoré', issue: 'Question commission', priority: 'low' }
              ].map((ticket, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{ticket.user}</p>
                    <p className="text-xs text-gray-600">{ticket.issue}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ticket.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : ticket.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.priority === 'high' ? 'Urgent' : 
                     ticket.priority === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/support')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accéder au Support Complet
            </button>
          </div>
        </div>
      </div>

      {/* Transactions à valider */}
      <TransactionTable 
        transactions={operations.filter(op => op.status === 'pending').slice(0, 5)}
        title="File d'Attente - Validation Requise"
      />
    </div>
  );
};

export default SousAdminDashboard;
