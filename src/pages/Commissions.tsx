import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommissions, useCommissionSummary } from '@/hooks/useCommissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const Commissions = () => {
  const { user } = useAuth();
  
  // État des filtres
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [statusFilter, setStatusFilter] = useState('all');

  // Hooks
  const { data: commissions = [], isLoading } = useCommissions(user?.id, {
    period: selectedPeriod,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  const { data: summary } = useCommissionSummary(user?.id);

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'paid': 'bg-green-100 text-green-800 border-green-300',
      'processing': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    const labels = {
      'pending': 'Non Payée',
      'paid': 'Payée',
      'processing': 'En cours'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const exportCommissions = () => {
    // TODO: Implémenter l'export CSV/PDF
    console.log('Export des commissions...');
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
          Suivez vos gains et commissions générées par vos opérations
        </p>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Totales Dues</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.total_pending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de paiement
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary?.total_paid || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Période sélectionnée
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions du Mois</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary?.current_month || 0)}
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
            Filtres de Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut du Paiement</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">Non payées</SelectItem>
                  <SelectItem value="paid">Payées</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCommissions}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4" />
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
            Détail des Commissions ({commissions.length} entrées)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportCommissions}>
            <FileText className="h-4 w-4 mr-2" />
            Relevé de commissions
          </Button>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Opération</TableHead>
                    <TableHead>ID Opération</TableHead>
                    <TableHead>Type d'Opération</TableHead>
                    <TableHead>Montant Opération</TableHead>
                    <TableHead>Base de Calcul</TableHead>
                    <TableHead>Taux/Règle</TableHead>
                    <TableHead>Commission Générée</TableHead>
                    <TableHead>Statut Paiement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {formatDate(commission.operation?.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {commission.operation?.reference_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {commission.operation?.operation_types?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {commission.operation?.operation_types?.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(commission.operation?.amount || 0)}
                      </TableCell>
                      <TableCell>
                        {commission.calculation_base || 'Montant opération'}
                      </TableCell>
                      <TableCell>
                        {commission.commission_rule?.rule_type === 'percentage' 
                          ? `${commission.commission_rule?.percentage}%`
                          : formatCurrency(commission.commission_rule?.fixed_amount || 0)
                        }
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(commission.agent_commission)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
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
                {statusFilter !== 'all' || selectedPeriod !== 'all'
                  ? 'Aucune commission ne correspond aux filtres sélectionnés'
                  : 'Vous n\'avez pas encore généré de commissions'
                }
              </p>
              {(!statusFilter || statusFilter === 'all') && selectedPeriod === 'all' && (
                <Button onClick={() => window.location.href = '/operations/new'}>
                  Créer votre première opération
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