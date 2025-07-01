import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRechargeRequests } from '@/hooks/useRechargeRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Plus, 
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const RechargeRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État du formulaire
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState('normal');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { 
    data: rechargeRequests, 
    isLoading, 
    createRequest,
    refetch 
  } = useRechargeRequests(user?.id);

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
      'processing': 'En traitement'
    };

    const icons = {
      'pending': <Clock className="h-3 w-3" />,
      'approved': <CheckCircle className="h-3 w-3" />,
      'rejected': <XCircle className="h-3 w-3" />,
      'processing': <AlertCircle className="h-3 w-3" />
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants] || variants.pending} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
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
      'urgent': 'Urgente'
    };

    return (
      <Badge className={variants[priority as keyof typeof variants] || variants.normal}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !reason) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant valide",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRequest({
        requester_id: user?.id,
        requested_amount: amountValue,
        priority,
        description: reason,
        ticket_type: 'recharge'
      });
      
      toast({
        title: "Demande soumise",
        description: "Votre demande de recharge a été envoyée à votre Chef d'Agence",
      });
      
      // Réinitialiser le formulaire
      setAmount('');
      setReason('');
      setPriority('normal');
      
      // Actualiser la liste
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission de la demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Demandes de Recharge
        </h1>
        <p className="text-gray-600 mt-2">
          Demandez un crédit à votre Chef d'Agence pour poursuivre vos opérations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de nouvelle demande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle Demande de Recharge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Montant */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant demandé *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1000"
                  step="1000"
                  required
                />
                <p className="text-xs text-gray-500">
                  Montant minimum : 1 000 XOF
                </p>
              </div>

              {/* Priorité */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Motif */}
              <div className="space-y-2">
                <Label htmlFor="reason">Motif de la demande *</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez brièvement pourquoi vous avez besoin de cette recharge..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* Informations sur le solde */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Votre solde actuel</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(user?.balance || 0)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Après validation, le montant sera ajouté à votre solde
                </p>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Soumission...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Soumettre la Demande
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="space-y-6">
          {/* Résumé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Résumé de vos Demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total demandes</span>
                  <span className="font-semibold">{rechargeRequests?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En attente</span>
                  <span className="font-semibold text-yellow-600">
                    {rechargeRequests?.filter(r => r.status === 'pending').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approuvées</span>
                  <span className="font-semibold text-green-600">
                    {rechargeRequests?.filter(r => r.status === 'approved').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejetées</span>
                  <span className="font-semibold text-red-600">
                    {rechargeRequests?.filter(r => r.status === 'rejected').length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Conseils
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <ul className="space-y-2">
                <li>• Soyez précis dans le motif de votre demande</li>
                <li>• Les demandes urgentes sont traitées en priorité</li>
                <li>• Votre Chef d'Agence sera notifié automatiquement</li>
                <li>• Le traitement prend généralement 24-48h</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique des demandes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique de vos Demandes
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : rechargeRequests && rechargeRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Réponse</TableHead>
                    <TableHead>Date de Traitement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rechargeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(request.requested_amount || 0)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={request.description}>
                          {request.description}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {request.resolution_notes ? (
                          <div className="truncate" title={request.resolution_notes}>
                            {request.resolution_notes}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.resolved_at ? formatDate(request.resolved_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune demande de recharge</h3>
              <p>Vous n'avez pas encore fait de demande de recharge</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RechargeRequest;