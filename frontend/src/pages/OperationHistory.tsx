import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperations } from '@/hooks/useOperations';
import { useOperationTypes } from '@/hooks/useOperationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const OperationHistory = () => {
  const { user } = useAuth();
  
  // État des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<any>(null);

  // Hooks
  const { data: operationTypes } = useOperationTypes(user?.agenceId);
  const { data: operations, isLoading, refetch } = useOperations({
    agentId: user?.id,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    typeId: typeFilter !== 'all' ? typeFilter : undefined,
    dateFrom,
    dateTo,
    orderBy: 'created_at',
    order: 'desc'
  });

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

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const exportData = () => {
    // TODO: Implémenter l'export CSV/PDF
    console.log('Export des données...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <History className="h-8 w-8" />
          Historique des Opérations
        </h1>
        <p className="text-gray-600 mt-2">
          Consultez et filtrez toutes vos transactions
        </p>
      </div>

      {/* Zone de filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche libre */}
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ID, bénéficiaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                  <SelectItem value="validated">Validées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par type */}
            <div className="space-y-2">
              <Label>Type d'opération</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {operationTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtres de date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="date-from">Date de début</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-to">Date de fin</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des opérations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Résultats ({operations?.length || 0} opérations)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {operations && operations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Validateur</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {operation.operation_types?.name || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {operation.operation_types?.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(operation.amount)}
                      </TableCell>
                      <TableCell>
                        {operation.operation_data?.beneficiaire || 
                         operation.operation_data?.destinataire || 
                         operation.operation_data?.client || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(operation.status)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(operation.commission_amount || 0)}
                      </TableCell>
                      <TableCell>
                        {operation.validator?.name || 
                         operation.profiles?.name || 'Non assigné'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOperation(operation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Détails de l'Opération #{operation.reference_number}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedOperation && (
                              <div className="space-y-6">
                                {/* Informations générales */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                                    <p>{formatDate(selectedOperation.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedOperation.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                                    <p>{selectedOperation.operation_types?.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Montant</Label>
                                    <p className="font-semibold">{formatCurrency(selectedOperation.amount)}</p>
                                  </div>
                                </div>

                                {/* Données de l'opération */}
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Informations saisies</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <pre className="text-sm">
                                      {JSON.stringify(selectedOperation.operation_data, null, 2)}
                                    </pre>
                                  </div>
                                </div>

                                {/* Commission */}
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Commission</Label>
                                  <p className="text-green-600 font-semibold">
                                    {formatCurrency(selectedOperation.commission_amount || 0)}
                                  </p>
                                </div>

                                {/* Message de rejet si applicable */}
                                {selectedOperation.status === 'rejected' && selectedOperation.error_message && (
                                  <div>
                                    <Label className="text-sm font-medium text-red-500">Motif de rejet</Label>
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-red-800">{selectedOperation.error_message}</p>
                                    </div>
                                  </div>
                                )}

                                {/* TODO: Afficher la preuve (image) */}
                                {selectedOperation.proof_url && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Preuve jointe</Label>
                                    <div className="mt-2">
                                      <img 
                                        src={selectedOperation.proof_url} 
                                        alt="Preuve de transaction"
                                        className="max-w-full h-auto rounded-lg border"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune opération trouvée</h3>
              <p className="mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFrom || dateTo
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Vous n\'avez pas encore d\'opérations'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && typeFilter === 'all' && !dateFrom && !dateTo) && (
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

export default OperationHistory;