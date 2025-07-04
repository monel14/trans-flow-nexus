import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRechargeRequests, useCreateRechargeRequest } from '@/hooks/useRechargeRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  History,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const RechargeRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    amount: '',
    priority: 'normal',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { data: requests = [], isLoading } = useRechargeRequests(user?.id);
  const createRequest = useCreateRechargeRequest();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide",
        variant: "destructive"
      });
      return;
    }

    if (amount < 10000) {
      toast({
        title: "Montant insuffisant",
        description: "Le montant minimum pour une recharge est de 10,000 FCFA",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRequest.mutateAsync({
        amount,
        priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent',
        description: formData.description || undefined,
        requester_id: user?.id!,
        assigned_to_id: user?.agenceId, // Chef d'agence
        ticket_type: 'recharge_request'
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de recharge a été transmise à votre Chef d'Agence",
      });
      
      // Réinitialiser le formulaire
      setFormData({
        amount: '',
        priority: 'normal',
        description: ''
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Demandes de Recharge
        </h1>
        <p className="text-gray-600 mt-2">
          Demandez une recharge de solde à votre Chef d'Agence
        </p>
      </div>

      {/* Informations sur le solde actuel */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Votre solde actuel</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(user?.balance || 0)}
              </div>
            </div>
            {(user?.balance || 0) < 50000 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Solde faible</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="text-2xl font-bold text-green-600">
                {approvedRequests.length}
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
                {rejectedRequests.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                Rejetées
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de nouvelle demande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvelle Demande de Recharge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant souhaité (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="10000"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Ex: 100000"
                  required
                />
                <p className="text-xs text-gray-500">Montant minimum : 10,000 FCFA</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <select 
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Faible</option>
                  <option value="normal">Normal</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Motif / Commentaire (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expliquez brièvement pourquoi vous avez besoin de cette recharge..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ amount: '', priority: 'normal', description: '' })}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !formData.amount}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Envoyer la Demande
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historique des demandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique de Mes Demandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Demande</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date Traitement</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
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
                      <TableCell>
                        {request.resolved_at ? formatDate(request.resolved_at) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {request.description && (
                            <p className="text-sm">{request.description}</p>
                          )}
                          {request.resolution_notes && (
                            <p className="text-sm text-gray-600 italic">
                              Réponse: {request.resolution_notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
              <p className="mb-4">
                Vous n'avez pas encore fait de demande de recharge
              </p>
              <p className="text-sm">
                Utilisez le formulaire ci-dessus pour envoyer votre première demande
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RechargeRequest;