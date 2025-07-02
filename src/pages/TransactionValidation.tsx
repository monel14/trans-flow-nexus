
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
import { CheckCircle, XCircle, Eye, UserPlus, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { 
  useValidationQueueStats, 
  useOperationsByQueue, 
  useAssignOperation,
  useReleaseOperation
} from '@/hooks/useDashboard';
import { useValidateOperation } from '@/hooks/useOperations';

const TransactionValidation = () => {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Données mockées
  const unassignedTransactions = [
    {
      id: 'TXN001',
      date: '2024-01-15 14:30',
      agent: 'Ousmane Kaboré',
      agence: 'Agence Centre-Ville',
      type: 'Transfert Western Union',
      amount: 75000,
      beneficiary: '+226 70 XX XX XX',
      proof: 'proof_001.jpg',
      urgent: false
    },
    {
      id: 'TXN002',
      date: '2024-01-15 10:15',
      agent: 'Aminata Traoré',
      agence: 'Agence Ouaga 2000',
      type: 'Paiement Facture SONABEL',
      amount: 125000,
      beneficiary: 'Réf: FAC123456',
      proof: 'proof_002.pdf',
      urgent: true
    }
  ];

  const myTransactions = [
    {
      id: 'TXN003',
      date: '2024-01-15 09:00',
      agent: 'Ibrahim Sawadogo',
      agence: 'Agence Koudougou',
      type: 'Recharge Orange Money',
      amount: 50000,
      beneficiary: '+226 75 XX XX XX',
      proof: 'proof_003.jpg',
      assignedAt: '2024-01-15 08:45',
      urgent: false
    }
  ];

  const handleAssignToMe = (transactionId: string) => {
    toast({
      title: "Transaction assignée",
      description: `La transaction ${transactionId} vous a été assignée.`,
    });
  };

  const handleValidate = (transactionId: string) => {
    toast({
      title: "Transaction validée",
      description: `La transaction ${transactionId} a été validée avec succès.`,
    });
    setSelectedTransaction(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer un motif de rejet.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Transaction rejetée",
      description: `La transaction a été rejetée. L'agent sera notifié.`,
    });
    setSelectedTransaction(null);
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  const TransactionTable = ({ transactions, showAssignActions = false }: any) => (
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
            <TableHead>Priorité</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.agent}</TableCell>
              <TableCell>{transaction.agence}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell className="font-medium">
                {transaction.amount.toLocaleString()} FCFA
              </TableCell>
              <TableCell>
                {transaction.urgent ? (
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
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {showAssignActions && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAssignToMe(transaction.id)}
                      title="S'assigner"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

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
              <div className="text-2xl font-bold text-orange-600">
                {unassignedTransactions.length}
              </div>
              <div className="text-sm text-gray-600">Non Assignées</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {myTransactions.length}
              </div>
              <div className="text-sm text-gray-600">Mes Transactions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {unassignedTransactions.filter(t => t.urgent).length}
              </div>
              <div className="text-sm text-gray-600">Urgentes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-gray-600">Validées Aujourd'hui</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes vues */}
      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Non Assignées ({unassignedTransactions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="my-transactions" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Mes Transactions ({myTransactions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>Transactions Non Assignées</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={unassignedTransactions} showAssignActions={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-transactions">
          <Card>
            <CardHeader>
              <CardTitle>Mes Transactions en Cours</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={myTransactions} showAssignActions={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={[...unassignedTransactions, ...myTransactions]} 
                showAssignActions={false} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détail de transaction */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détail de la Transaction {selectedTransaction?.id}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Agent</Label>
                  <p className="font-medium">{selectedTransaction.agent}</p>
                </div>
                <div>
                  <Label>Agence</Label>
                  <p>{selectedTransaction.agence}</p>
                </div>
                <div>
                  <Label>Type d'opération</Label>
                  <p>{selectedTransaction.type}</p>
                </div>
                <div>
                  <Label>Montant</Label>
                  <p className="font-bold text-green-600">
                    {selectedTransaction.amount.toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <Label>Bénéficiaire</Label>
                  <p>{selectedTransaction.beneficiary}</p>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <p>{selectedTransaction.date}</p>
                </div>
              </div>

              <div>
                <Label>Preuve de transaction</Label>
                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    📄 {selectedTransaction.proof}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ouvrir la preuve
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleValidate(selectedTransaction.id)}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                  Libérer
                </Button>
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
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                Confirmer le Rejet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1"
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
