
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Clock, CheckCircle, X, DollarSign, User, Calendar } from 'lucide-react';
import { useAgentRechargeRequests, useProcessRecharge } from '@/hooks/useRechargeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const AgentRecharges = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Get recharge requests for the agency
  const { data: requests = [], isLoading, refetch } = useAgentRechargeRequests(user?.agenceId);
  const processRechargeMutation = useProcessRecharge();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcess = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      await processRechargeMutation.mutateAsync({
        requestId: selectedRequest.id,
        action,
        notes,
        amount: action === 'approve' ? parseFloat(amount) : undefined,
      });

      setDialogOpen(false);
      setSelectedRequest(null);
      setAmount('');
      setNotes('');
      refetch();

      toast({
        title: action === 'approve' ? 'Recharge approuvée' : 'Recharge rejetée',
        description: `La demande a été ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
    }
  };

  const openProcessDialog = (request: any) => {
    setSelectedRequest(request);
    setAmount(request.requested_amount?.toString() || '');
    setNotes('');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((req: any) => req.status === 'pending');
  const processedRequests = requests.filter((req: any) => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Demandes de Recharge</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de recharge des agents de votre agence.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {processedRequests.filter((req: any) => req.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {processedRequests.filter((req: any) => req.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processedRequests
                .filter((req: any) => req.status === 'approved')
                .reduce((sum: number, req: any) => sum + (req.approved_amount || 0), 0)
                .toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demandes en Attente */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Demandes en Attente ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Ces demandes nécessitent votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request: any) => {
                // Handle both array and object types for profiles
                const profile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{profile?.name || 'Agent inconnu'}</p>
                          <p className="text-sm text-muted-foreground">{profile?.email || 'Email non disponible'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Montant Demandé</p>
                        <p className="font-medium">{request.requested_amount?.toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Solde Actuel</p>
                        <p className="font-medium">{profile?.balance ? profile.balance.toLocaleString() : '0'} FCFA</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ticket</p>
                        <p className="font-medium">{request.ticket_number}</p>
                      </div>
                    </div>

                    {request.description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{request.description}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={() => openProcessDialog(request)}>
                        Traiter la Demande
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des Demandes
            </CardTitle>
            <CardDescription>
              Demandes traitées récemment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedRequests.slice(0, 10).map((request: any) => {
                // Handle both array and object types for profiles
                const profile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{profile?.name || 'Agent inconnu'}</p>
                          <p className="text-sm text-muted-foreground">{profile?.email || 'Email non disponible'}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Montant {request.status === 'approved' ? 'Approuvé' : 'Demandé'}</p>
                        <p className="font-medium">
                          {request.status === 'approved' 
                            ? (request.approved_amount || 0).toLocaleString()
                            : (request.requested_amount || 0).toLocaleString()
                          } FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date Traitement</p>
                        <p className="font-medium">
                          {request.resolved_at 
                            ? new Date(request.resolved_at).toLocaleDateString('fr-FR')
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Priorité</p>
                        <Badge className={getPriorityColor(request.priority)} variant="outline">
                          {request.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ticket</p>
                        <p className="font-medium">{request.ticket_number}</p>
                      </div>
                    </div>

                    {request.resolution_notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notes de Résolution</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{request.resolution_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Traitement */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Traiter la Demande de Recharge</DialogTitle>
            <DialogDescription>
              Approuver ou rejeter la demande de recharge de {
                selectedRequest && Array.isArray(selectedRequest.profiles) 
                  ? selectedRequest.profiles[0]?.name 
                  : selectedRequest?.profiles?.name
              }
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Montant Demandé</p>
                  <p className="font-medium">{selectedRequest.requested_amount?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <Badge className={getPriorityColor(selectedRequest.priority)} variant="outline">
                    {selectedRequest.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant à Approuver (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant à approuver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez des notes explicatives..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleProcess('reject')}
              disabled={processRechargeMutation.isPending}
            >
              Rejeter
            </Button>
            <Button
              onClick={() => handleProcess('approve')}
              disabled={processRechargeMutation.isPending || !amount}
            >
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentRecharges;
