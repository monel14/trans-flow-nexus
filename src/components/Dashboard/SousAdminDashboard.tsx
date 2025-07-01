
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { 
  CheckCircle, 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import TransactionTable from '../Tables/TransactionTable';

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
      label: 'Validation Transactions',
      icon: CheckCircle,
      onClick: () => navigate('/validation'),
      variant: 'default' as const
    },
    {
      label: 'Gestion Requêtes',
      icon: FileText,
      onClick: () => navigate('/support'),
      variant: 'secondary' as const
    },
    {
      label: 'Historique Validations',
      icon: Clock,
      onClick: () => console.log('Historique'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord - Sous-Administrateur
        </h1>
        <p className="text-gray-600">Bienvenue, {user?.name}</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Transactions en Attente"
          value={pendingTransactions}
          icon={AlertTriangle}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <MetricCard
          title="Validées Aujourd'hui"
          value={completedToday}
          icon={CheckCircle}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <MetricCard
          title="Requêtes Assignées"
          value="5"
          icon={FileText}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Actions Rapides" />

      {/* Zone de travail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité de Validation</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique d'activité</p>
          </div>
        </div>

        <TransactionTable 
          transactions={operations.filter(op => op.status === 'pending').slice(0, 5)}
          title="Transactions à Valider"
        />
      </div>
    </div>
  );
};

export default SousAdminDashboard;
