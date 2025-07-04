
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  useSousAdminDashboardKPIs, 
  useSupportTickets, 
  useRecentTransactions,
  useValidationQueueStats
} from '@/hooks/useDashboard';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  FileText,
  Settings,
  Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const SousAdminDashboard = () => {
  const { data: kpis, isLoading: kpisLoading } = useSousAdminDashboardKPIs();
  const { data: tickets, isLoading: ticketsLoading } = useSupportTickets(5);
  const { data: transactions, isLoading: transactionsLoading } = useRecentTransactions(5);
  const { data: validationStats } = useValidationQueueStats();

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Sous-Admin</h1>
          <p className="text-gray-600 mt-2">Gestion des tickets et support utilisateurs</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpis?.pending_urgent?.count || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis?.pending_urgent?.subtitle}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kpis?.completed_today?.count || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis?.completed_today?.subtitle}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(kpis?.support_tickets?.open || 0) + (kpis?.support_tickets?.in_progress || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis?.support_tickets?.subtitle}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {kpis?.avg_processing_time?.hours || 0}h
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis?.avg_processing_time?.subtitle}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignés</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {kpis?.my_assignments?.count || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kpis?.my_assignments?.subtitle}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Queue Stats */}
      {validationStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              File de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationStats.unassigned_count}
                </div>
                <p className="text-sm text-gray-500">Non assignées</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationStats.my_tasks_count}
                </div>
                <p className="text-sm text-gray-500">Mes tâches</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {validationStats.urgent_count}
                </div>
                <p className="text-sm text-gray-500">Urgentes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(validationStats.oldest_pending_hours)}h
                </div>
                <p className="text-sm text-gray-500">Plus ancienne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets de Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tickets de Support</span>
              <Badge variant="secondary">
                {ticketsLoading ? 'Chargement...' : `${tickets?.length || 0} tickets`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets?.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          ticket.priority === 'high' ? 'destructive' :
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                        <span className="text-sm font-medium">{ticket.title}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Par {ticket.profiles ? (Array.isArray(ticket.profiles) ? ticket.profiles[0]?.name : ticket.profiles.name) : 'Utilisateur inconnu'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {!tickets?.length && (
                  <p className="text-center text-gray-500 py-8">
                    Aucun ticket de support actif
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transactions Récentes</span>
              <Badge variant="secondary">
                {transactionsLoading ? 'Chargement...' : `${transactions?.length || 0} transactions`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending_validation' ? 'secondary' : 'outline'
                        }>
                          {transaction.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {transaction.profiles ? (Array.isArray(transaction.profiles) ? transaction.profiles[0]?.name : transaction.profiles.name) : 'Utilisateur inconnu'} - {transaction.agencies ? (Array.isArray(transaction.agencies) ? transaction.agencies[0]?.name : transaction.agencies.name) : 'Agence inconnue'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {transaction.reference_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {!transactions?.length && (
                  <p className="text-center text-gray-500 py-8">
                    Aucune transaction récente
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SousAdminDashboard;
