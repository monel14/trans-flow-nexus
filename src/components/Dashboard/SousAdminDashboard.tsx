
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
  
  // Récupération des données dynamiques
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useSousAdminDashboardKPIs();
  const { data: recentOperations = [], isLoading: operationsLoading } = useRecentOperations(5);

  // Calculer les opérations en attente à partir des données récentes pour affichage
  const pendingTransactions = recentOperations.filter(op => op.status === 'pending' || op.status === 'pending_validation').length;

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

  // Gestion des erreurs
  if (kpisError) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bureau d'Assistance - Sous-Administrateur
          </h1>
          <p className="text-indigo-100">
            Une erreur s'est produite lors du chargement des données
          </p>
        </div>
      </div>
    );
  }

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
        {kpisLoading ? (
          // Skeletons pendant le chargement
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
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
              title="À Valider (Urgent)"
              value={kpis?.pending_urgent?.count?.toString() || '0'}
              icon={AlertTriangle}
              iconColor="text-orange-500"
              valueColor="text-orange-600"
              subtitle={kpis?.pending_urgent?.subtitle || 'Aucune donnée'}
            />
            <MetricCard
              title="Validées Aujourd'hui"
              value={kpis?.completed_today?.count?.toString() || '0'}
              icon={CheckCircle}
              iconColor="text-green-500"
              valueColor="text-green-600"
              subtitle={kpis?.completed_today?.subtitle || 'Aucune donnée'}
            />
            <MetricCard
              title="Tickets Support"
              value={kpis?.support_tickets?.open?.toString() || '0'}
              icon={MessageSquare}
              iconColor="text-blue-500"
              valueColor="text-blue-600"
              subtitle={kpis?.support_tickets?.subtitle || 'Aucune donnée'}
            />
            <MetricCard
              title="Temps Moyen"
              value={kpis?.avg_processing_time?.formatted || '0 min'}
              icon={Clock}
              iconColor="text-purple-500"
              valueColor="text-purple-600"
              subtitle={kpis?.avg_processing_time?.subtitle || 'Aucune donnée'}
            />
          </>
        )}
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
            {operationsLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </h3>
          <div className="space-y-3">
            {operationsLoading ? (
              // Skeletons pour les transactions
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : recentOperations.length > 0 ? (
              recentOperations
                .filter(op => op.status === 'pending' || op.status === 'pending_validation')
                .slice(0, 4)
                .map((operation, index) => {
                  const isUrgent = operation.amount > 500000 || 
                    new Date().getTime() - new Date(operation.created_at).getTime() > 24 * 60 * 60 * 1000;
                  
                  return (
                    <div key={operation.id} className={`p-3 rounded-lg border ${
                      isUrgent 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {operation.operation_types?.name || 'Type inconnu'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {operation.amount.toLocaleString()} XOF
                          </p>
                          <p className="text-xs text-gray-400">
                            Agent: {operation.profiles?.name || 'Inconnu'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isUrgent && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              URGENT
                            </span>
                          )}
                          <button 
                            onClick={() => navigate('/validation')}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                          >
                            Valider
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>Aucune validation en attente</p>
                <p className="text-sm">Toutes les transactions ont été traitées</p>
              </div>
            )}
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
                {kpisLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {kpis?.support_tickets?.open || 0}
                  </p>
                )}
                <p className="text-sm text-blue-700">Tickets ouverts</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                {kpisLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {kpis?.support_tickets?.resolved_week || 0}
                  </p>
                )}
                <p className="text-sm text-green-700">Résolus cette semaine</p>
              </div>
            </div>

            {/* Tickets récents - données statiques pour l'instant */}
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
      {!operationsLoading && (
        <TransactionTable 
          transactions={recentOperations.filter(op => op.status === 'pending' || op.status === 'pending_validation').slice(0, 5)}
          title="File d'Attente - Validation Requise"
        />
      )}
    </div>
  );
};

export default SousAdminDashboard;
