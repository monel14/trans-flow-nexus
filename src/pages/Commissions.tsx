import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommissions } from '@/hooks/useCommissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const Commissions = () => {
  const { user } = useAuth();
  
  // État des filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Hooks
  const { data: commissions, isLoading, refetch } = useCommissions(user?.id, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom,
    dateTo
  });

  // Calculs des statistiques
  const totalCommissions = commissions?.reduce((sum, c) => sum + c.agent_commission, 0) || 0;
  const paidCommissions = commissions?.filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.agent_commission, 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.agent_commission, 0) || 0;

  // Commissions du mois en cours
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCommissions = commissions?.filter(c => {
    const date = new Date(c.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, c) => sum + c.agent_commission, 0) || 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-orange-100 text-orange-800 border-orange-300',
      'paid': 'bg-green-100 text-green-800 border-green-300',
      'processing': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    const labels = {
      'pending': 'En attente',
      'paid': 'Payée',
      'processing': 'En traitement'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const exportCommissions = () => {
    // TODO: Implémenter l'export PDF/CSV
    console.log('Export des commissions...');
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Mes Commissions
        </h1>
        <p className="text-gray-600 mt-2">
          Suivez vos gains et l'évolution de vos commissions
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Commissions */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes opérations confondues
            </p>
          </CardContent>
        </Card>

        {/* Commissions Payées */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paidCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Déjà versées
            </p>
          </CardContent>
        </Card>

        {/* Commissions En Attente */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendingCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              À recevoir
            </p>
          </CardContent>
        </Card>

        {/* Commissions du Mois */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois-ci</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(monthlyCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtre par statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payées</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de début */}
            <div className="space-y-2">
              <Label htmlFor="date-from">Date de début</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            {/* Date de fin */}
            <div className="space-y-2">
              <Label htmlFor="date-to">Date de fin</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={exportCommissions}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau détaillé des commissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Détail des Commissions ({commissions?.length || 0})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Opération</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant Opération</TableHead>
                    <TableHead>Base de Calcul</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de Paiement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {formatDate(commission.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {commission.operations?.reference_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {commission.operations?.operation_types?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(commission.operations?.amount || 0)}
                      </TableCell>
                      <TableCell>
                        {commission.commission_rules?.commission_type === 'percentage' && (
                          <span>{commission.commission_rules.percentage_rate}%</span>
                        )}
                        {commission.commission_rules?.commission_type === 'fixed' && (
                          <span>Montant fixe</span>
                        )}
                        {commission.commission_rules?.commission_type === 'tiered' && (
                          <span>Paliers</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(commission.agent_commission)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
                      </TableCell>
                      <TableCell>
                        {commission.paid_at ? formatDate(commission.paid_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune commission trouvée</h3>
              <p className="mb-4">
                {statusFilter !== 'all' || dateFrom || dateTo
                  ? 'Essayez de modifier vos filtres'
                  : 'Vous n\'avez pas encore gagné de commissions'
                }
              </p>
              {(!statusFilter || statusFilter === 'all') && !dateFrom && !dateTo && (
                <Button onClick={() => window.location.href = '/operations/new'}>
                  Créer une opération
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Commissions;