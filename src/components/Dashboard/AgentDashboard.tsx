import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactionLedger } from '@/hooks/useTransactionLedger';
import { useCommissions } from '@/hooks/useCommissions';
import { useOperations } from '@/hooks/useOperations';
import { 
  Plus, 
  CreditCard, 
  History, 
  TrendingUp, 
  Eye,
  Wallet,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Hooks pour récupérer les données
  const { data: ledger } = useTransactionLedger(user?.id);
  const { data: commissions } = useCommissions(user?.id);
  const { data: operations } = useOperations({ 
    agentId: user?.id, 
    limit: 5,
    orderBy: 'created_at',
    order: 'desc'
  });

  // Calculs des métriques
  const currentBalance = user?.balance || 0;
  const monthlyCommissions = commissions?.filter(c => {
    const date = new Date(c.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + c.agent_commission, 0) || 0;
  
  const totalCommissionsDue = commissions?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.agent_commission, 0) || 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'validated': 'bg-green-100 text-green-800 border-green-300', 
      'rejected': 'bg-red-100 text-red-800 border-red-300',
      'processing': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    const labels = {
      'pending': 'En attente',
      'validated': 'Validée',
      'rejected': 'Rejetée', 
      'processing': 'En cours'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.name || 'Agent'} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre activité aujourd'hui
        </p>
      </div>

      {/* Cartes de Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solde Actuel */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Actuel</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible pour opérations
            </p>
          </CardContent>
        </Card>

        {/* Commissions du Mois */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions du Mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        {/* Commissions Totales Dues */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Totales Dues</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalCommissionsDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de paiement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/operations/new')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Nouvelle Opération</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/recharge')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Demander Recharge</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/operations/history')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <History className="h-6 w-6" />
              <span>Historique</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/commissions')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Mes Commissions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des Dernières Opérations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Dernières Opérations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/operations/history')}
          >
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          {operations && operations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-mono text-xs">
                      {operation.reference_number}
                    </TableCell>
                    <TableCell>
                      {formatDate(operation.created_at)}
                    </TableCell>
                    <TableCell>
                      {operation.operation_types?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(operation.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(operation.status)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(operation.commission_amount || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Ouvrir modale de détail */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune opération récente</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/operations/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première opération
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;