import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentRechargeRequests, useProcessRecharge } from '@/hooks/useRechargeRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Wallet,
  ArrowDownLeft,
  History,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const AgentRecharges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État des modales
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hooks
  const { data: requests = [], isLoading } = useAgentRechargeRequests(user?.agenceId);
  const processRecharge = useProcessRecharge();

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300',
      'processing': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    const labels = {
      'pending': 'En attente',
      'approved': 'Approuvée',
      'rejected': 'Rejetée',
      'processing': 'En cours'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      'low': 'Faible',
      'normal': 'Normal',
      'high': 'Élevée',
      'urgent': 'Urgent'
    };

    return (
      <Badge className={variants[priority as keyof typeof variants] || variants.normal}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setActionType('approve');
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setActionType('reject');
    setRejectReason('');
  };

  const processAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'reject' && !rejectReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer un motif de rejet",
        variant: "destructive"
      });
      return;
    }

    if (actionType === 'approve' && (user?.balance || 0) < selectedRequest.requested_amount) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour approuver cette recharge",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await processRecharge.mutateAsync({
        requestId: selectedRequest.id,
        action: actionType,
        notes: actionType === 'reject' ? rejectReason : `Recharge approuvée et transférée`,
        amount: actionType === 'approve' ? selectedRequest.requested_amount : undefined
      });
      
      toast({
        title: actionType === 'approve' ? "Recharge approuvée" : "Demande rejetée",
        description: actionType === 'approve' 
          ? `${formatCurrency(selectedRequest.requested_amount)} transférés vers ${selectedRequest.profiles?.name}`
          : "L'agent sera notifié du rejet de sa demande",
      });
      
      // Fermer la modale
      setSelectedRequest(null);
      setActionType(null);
      setRejectReason('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement de la demande",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Gestion des Recharges Agents
        </h1>
        <p className="text-gray-600 mt-2">
          Traitez les demandes de recharge de solde de vos agents
        </p>
      </div>

      {/* Informations sur le solde du chef */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Votre solde disponible</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(user?.balance || 0)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Demandes en attente</div>
              <div className="text-xl font-semibold text-orange-600">
                {formatCurrency(pendingRequests.reduce((sum, r) => sum + (r.requested_amount || 0), 0))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingRequests.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                En attente
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {pendingRequests.filter(r => r.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Urgentes
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {processedRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Approuvées
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {processedRequests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                Rejetées
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes vues */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>En Attente ({pendingRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Traitées ({processedRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Demandes en Attente de Traitement</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Solde Agent</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {formatDate(request.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{request.profiles?.name}</span>
                              <span className="text-sm text-gray-500">{request.profiles?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(request.requested_amount || 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(request.profiles?.balance || 0)}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(request.priority)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate" title={request.description}>
                              {request.description || 'Aucun motif spécifié'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request)}
                                disabled={(user?.balance || 0) < (request.requested_amount || 0)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande en attente</h3>
                  <p>Toutes les demandes de recharge ont été traitées</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Demandes Traitées</CardTitle>
            </CardHeader>
            <CardContent>
              {processedRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Demande</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date Traitement</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {formatDate(request.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{request.profiles?.name}</span>
                              <span className="text-sm text-gray-500">{request.profiles?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(request.requested_amount || 0)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            {request.resolved_at ? formatDate(request.resolved_at) : '-'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm" title={request.resolution_notes}>
                              {request.resolution_notes || '-'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande traitée</h3>
                  <p>L'historique apparaîtra ici après traitement des demandes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modale de confirmation d'approbation */}
      <Dialog open={actionType === 'approve' && !!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
              Confirmer le Transfert de Fonds
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Détails du transfert</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bénéficiaire :</span>
                    <span className="font-medium">{selectedRequest.profiles?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant à transférer :</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(selectedRequest.requested_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Votre solde actuel :</span>
                    <span>{formatCurrency(user?.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Votre nouveau solde :</span>
                    <span className="font-semibold">
                      {formatCurrency((user?.balance || 0) - selectedRequest.requested_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={processAction}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer le Transfert
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedRequest(null);
                    setActionType(null);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale de rejet */}
      <Dialog open={actionType === 'reject' && !!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
        setRejectReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Rejeter la Demande
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Vous êtes sur le point de rejeter la demande de recharge de{' '}
                  <span className="font-medium">{selectedRequest.profiles?.name}</span>{' '}
                  pour un montant de{' '}
                  <span className="font-semibold">{formatCurrency(selectedRequest.requested_amount)}</span>.
                </p>
              </div>

              <div>
                <Label htmlFor="reject-reason">Motif du rejet *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={processAction}
                  disabled={isProcessing || !rejectReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    'Confirmer le Rejet'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedRequest(null);
                    setActionType(null);
                    setRejectReason('');
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentRecharges;