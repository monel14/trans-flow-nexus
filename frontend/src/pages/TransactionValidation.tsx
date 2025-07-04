import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, UserPlus, Clock, AlertTriangle, Loader2, Image, FileText } from 'lucide-react';
import { 
  useValidationQueueStats, 
  useOperationsByQueue, 
  useAssignOperation,
  useReleaseOperation
} from '@/hooks/useDashboard';
import { useValidateOperation } from '@/hooks/useOperations';
import ProofViewer from '@/components/ProofViewer';

const TransactionValidation = () => {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unassigned');

  // Hooks pour les données réelles
  const { data: queueStats, isLoading: statsLoading } = useValidationQueueStats();
  const { data: unassignedOps = [], isLoading: unassignedLoading } = useOperationsByQueue('unassigned');
  const { data: myTasksOps = [], isLoading: myTasksLoading } = useOperationsByQueue('my_tasks');
  const { data: allTasksOps = [], isLoading: allTasksLoading } = useOperationsByQueue('all_tasks');
  
  // Mutations
  const assignOperation = useAssignOperation();
  const releaseOperation = useReleaseOperation();
  const validateOperation = useValidateOperation();

  const handleAssignToMe = async (operationId: string) => {
    try {
      await assignOperation.mutateAsync({ operation_id: operationId });
      toast({
        title: "Transaction assignée",
        description: `La transaction ${operationId} vous a été assignée.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'assignation",
        variant: "destructive"
      });
    }
  };

  const handleValidate = async (operationId: string) => {
    try {
      await validateOperation.mutateAsync({
        operation_id: operationId,
        action: 'approve'
      });
      toast({
        title: "Transaction validée",
        description: `La transaction ${operationId} a été validée avec succès.`,
      });
      setSelectedTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la validation",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer un motif de rejet.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTransaction) return;

    try {
      await validateOperation.mutateAsync({
        operation_id: selectedTransaction.id,
        action: 'reject',
        notes: rejectReason
      });
      
      toast({
        title: "Transaction rejetée",
        description: `La transaction a été rejetée. L'agent sera notifié.`,
      });
      setSelectedTransaction(null);
      setIsRejectModalOpen(false);
      setRejectReason('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du rejet",
        variant: "destructive"
      });
    }
  };

  const handleReleaseOperation = async (operationId: string) => {
    try {
      await releaseOperation.mutateAsync({ operation_id: operationId });
      toast({
        title: "Transaction libérée",
        description: "La transaction a été remise dans la file d'attente générale.",
      });
      setSelectedTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la libération",
        variant: "destructive"
      });
    }
  };

  const getProofIcon = (transaction: any) => {
    const proofUrl = transaction.operation_data?.proof_url;
    if (!proofUrl) {
      return <FileText className="h-4 w-4 text-gray-400" />;
    }
    
    const ext = proofUrl.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
    
    return isImage ? 
      <Image className="h-4 w-4 text-green-600" /> : 
      <FileText className="h-4 w-4 text-blue-600" />;
  };

  const TransactionTable = ({ 
    transactions, 
    showAssignActions = false, 
    isLoading = false 
  }: { 
    transactions: any[], 
    showAssignActions?: boolean, 
    isLoading?: boolean 
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium">Aucune transaction à traiter</p>
          <p className="text-sm">Toutes les transactions ont été validées</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Preuve</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction: any) => {
              const isUrgent = transaction.amount > 500000 || 
                new Date().getTime() - new Date(transaction.created_at).getTime() > 24 * 60 * 60 * 1000;
              const hasProof = transaction.operation_data?.proof_url;
              
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.reference_number || transaction.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString('fr-FR')} {new Date(transaction.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>{transaction.profiles?.name || 'Inconnu'}</TableCell>
                  <TableCell>{transaction.agencies?.name || 'Inconnue'}</TableCell>
                  <TableCell>{transaction.operation_types?.name || 'Type inconnu'}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.amount.toLocaleString()} XOF
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getProofIcon(transaction)}
                      {hasProof ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Manquante
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isUrgent ? (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                        title="Voir détails"
                        disabled={validateOperation.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {showAssignActions && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAssignToMe(transaction.id)}
                          title="S'assigner"
                          disabled={assignOperation.isPending}
                        >
                          {assignOperation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {!showAssignActions && transaction.status === 'pending_validation' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReleaseOperation(transaction.id)}
                          title="Libérer"
                          disabled={releaseOperation.isPending}
                        >
                          {releaseOperation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validation des Transactions</h1>
        <p className="text-gray-600">Validez les transactions soumises par les agents</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-orange-600">
                  {queueStats?.unassigned_count || 0}
                </div>
              )}
              <div className="text-sm text-gray-600">Non Assignées</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {queueStats?.my_tasks_count || 0}
                </div>
              )}
              <div className="text-sm text-gray-600">Mes Transactions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {queueStats?.urgent_count || 0}
                </div>
              )}
              <div className="text-sm text-gray-600">Urgentes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {queueStats?.completed_today || 0}
                </div>
              )}
              <div className="text-sm text-gray-600">Validées Aujourd'hui</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Non Assignées ({queueStats?.unassigned_count || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="my-transactions" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Mes Transactions ({queueStats?.my_tasks_count || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="all">Toutes ({queueStats?.all_tasks_count || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transactions Non Assignées</span>
                {unassignedLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={unassignedOps} 
                showAssignActions={true} 
                isLoading={unassignedLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mes Transactions en Cours</span>
                {myTasksLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={myTasksOps} 
                showAssignActions={false} 
                isLoading={myTasksLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Toutes les Transactions</span>
                {allTasksLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={allTasksOps} 
                showAssignActions={false} 
                isLoading={allTasksLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détail de transaction - VERSION AMÉLIORÉE */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détail de la Transaction {selectedTransaction?.reference_number || selectedTransaction?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Agent</Label>
                  <p className="font-medium">{selectedTransaction.profiles?.name || 'Inconnu'}</p>
                </div>
                <div>
                  <Label>Agence</Label>
                  <p>{selectedTransaction.agencies?.name || 'Inconnue'}</p>
                </div>
                <div>
                  <Label>Type d'opération</Label>
                  <p>{selectedTransaction.operation_types?.name || 'Type inconnu'}</p>
                </div>
                <div>
                  <Label>Montant</Label>
                  <p className="font-bold text-green-600">
                    {selectedTransaction.amount.toLocaleString()} XOF
                  </p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <p className="capitalize">{selectedTransaction.status}</p>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <p>{new Date(selectedTransaction.created_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              {/* Données de l'opération */}
              {selectedTransaction.operation_data && Object.keys(selectedTransaction.operation_data).filter(key => key !== 'proof_url').length > 0 && (
                <div>
                  <Label>Données de l'opération</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(selectedTransaction.operation_data).filter(([key]) => key !== 'proof_url')
                        ), 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {/* Section preuve améliorée */}
              <div>
                <Label className="text-base font-semibold">Preuve de transaction</Label>
                <div className="mt-3">
                  <ProofViewer 
                    proofUrl={selectedTransaction.operation_data?.proof_url}
                    transactionId={selectedTransaction.id}
                    transactionReference={selectedTransaction.reference_number}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button 
                  onClick={() => handleValidate(selectedTransaction.id)}
                  className="flex-1"
                  disabled={validateOperation.isPending}
                >
                  {validateOperation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Valider
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1"
                  disabled={validateOperation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                {selectedTransaction.status === 'pending_validation' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleReleaseOperation(selectedTransaction.id)}
                    disabled={releaseOperation.isPending}
                  >
                    Libérer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de rejet */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motif du rejet *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi cette transaction est rejetée..."
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleReject} 
                variant="destructive" 
                className="flex-1"
                disabled={validateOperation.isPending}
              >
                {validateOperation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Confirmer le Rejet"
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1"
                disabled={validateOperation.isPending}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionValidation;