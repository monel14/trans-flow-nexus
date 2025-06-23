import React, { useState } from 'react';
import { useRechargeRequests, useUpdateRechargeRequest } from '@/hooks/useRechargeRequests';
import { useCreateTransaction } from '@/hooks/useTransactionLedger';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Wallet,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AgentRecharges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { requests, isLoading, refetch } = useRechargeRequests({ 
    status: 'open' // Seules les demandes ouvertes pour traitement
  });
  const { updateRechargeRequest } = useUpdateRechargeRequest();
  const createTransaction = useCreateTransaction();

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (request: any) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      // Approuver la demande
      await updateRechargeRequest({
        id: request.id,
        updates: {
          status: 'resolved',
          resolved_by_id: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || 'Demande approuvée'
        }
      });

      // Créer la transaction de recharge
      if (request.requested_amount) {
        await createTransaction.mutateAsync({
          user_id: request.requester_id,
          transaction_type: 'credit',
          amount: request.requested_amount,
          description: `Recharge approuvée - ${request.title}`,
          metadata: {
            request_id: request.id,
            approved_by: user.id
          }
        });
      }

      toast({
        title: "Demande approuvée",
        description: "La demande de recharge a été approuvée avec succès.",
      });

      refetch();
      setSelectedRequest(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation de la demande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (request: any) => {
    if (!user?.id || !resolutionNotes.trim()) {
      toast({
        title: "Notes requises",
        description: "Veuillez ajouter une note expliquant le rejet.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await updateRechargeRequest({
        id: request.id,
        updates: {
          status: 'closed',
          resolved_by_id: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        }
      });

      toast({
        title: "Demande rejetée",
        description: "La demande de recharge a été rejetée.",
      });

      refetch();
      setSelectedRequest(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de la demande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(amount) + ' XOF';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Approuvée';
      case 'closed': return 'Rejetée';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recharges des Agents</h1>
          <p className="text-gray-600">Gérez les demandes de recharge de vos agents</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">{requests.length} en attente</span>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-orange-600">{requests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(requests.reduce((sum, req) => sum + (req.requested_amount || 0), 0))}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Priorité Haute</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(req => req.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agents Uniques</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(requests.map(req => req.requester_id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Recharge en Attente</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Aucune demande en attente</p>
              <p>Toutes les demandes ont été traitées !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{request.title}</h4>
                        <Badge className={getPriorityColor(request.priority)}>
                          {getPriorityLabel(request.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Ticket: {request.ticket_number}</span>
                        <span>Agent: {request.profiles?.name || 'N/A'}</span>
                        <span>
                          {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-2xl text-green-600 mb-4">
                        {request.requested_amount 
                          ? formatAmount(request.requested_amount) 
                          : '-'
                        }
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setResolutionNotes('');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Traiter
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Traiter la Demande de Recharge</DialogTitle>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">{selectedRequest.title}</h4>
                                <p className="text-gray-600 mb-2">{selectedRequest.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Agent:</span> {selectedRequest.profiles?.name}
                                  </div>
                                  <div>
                                    <span className="font-medium">Montant:</span> {formatAmount(selectedRequest.requested_amount || 0)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Priorité:</span> {getPriorityLabel(selectedRequest.priority)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Date:</span> {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Notes de résolution (optionnel pour approbation, obligatoire pour rejet)
                                </label>
                                <Textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Ajoutez vos commentaires sur cette demande..."
                                  rows={4}
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(selectedRequest)}
                                  disabled={isProcessing}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isProcessing ? 'Traitement...' : 'Approuver'}
                                </Button>
                                <Button
                                  onClick={() => handleReject(selectedRequest)}
                                  disabled={isProcessing}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeter
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentRecharges;
