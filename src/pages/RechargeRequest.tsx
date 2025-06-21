import React, { useState } from 'react';
import { useCreateRechargeRequest, useRechargeRequests } from '@/hooks/useRechargeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RechargeRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createRechargeRequest = useCreateRechargeRequest();
  const { requests, isLoading, refetch } = useRechargeRequests({ 
    requester_id: user?.id 
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requested_amount: '',
    priority: 'medium'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.requested_amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.requested_amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être un nombre positif",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createRechargeRequest.mutateAsync({
        title: formData.title,
        description: formData.description,
        requested_amount: amount,
        priority: formData.priority,
      });

      toast({
        title: "Demande créée",
        description: "Votre demande de recharge a été soumise avec succès",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        requested_amount: '',
        priority: 'medium'
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de recharge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      case 'open': return 'Ouverte';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolue';
      case 'closed': return 'Fermée';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demander une Recharge</h1>
        <p className="text-gray-600">Créez une demande de recharge de votre solde</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de nouvelle demande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle Demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre de la demande *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Recharge de solde pour opérations"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Montant demandé (XOF) *
                </label>
                <Input
                  type="number"
                  value={formData.requested_amount}
                  onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                  placeholder="100000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priorité
                </label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Justification *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Expliquez pourquoi vous avez besoin de cette recharge..."
                  rows={4}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Solde actuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Mon Solde Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatAmount(user?.balance || 0)}
              </div>
              <p className="text-gray-600 mb-4">Solde disponible</p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Comment ça marche ?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Soumettez votre demande avec justification</li>
                  <li>• Votre chef d'agence examine la demande</li>
                  <li>• Une fois approuvée, votre solde est crédité</li>
                  <li>• Vous recevez une notification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Demandes de Recharge</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune demande de recharge
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Ticket: {request.ticket_number}</span>
                        <span>
                          {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg mb-2">
                        {request.requested_amount 
                          ? formatAmount(request.requested_amount) 
                          : '-'
                        }
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <Badge className={getPriorityColor(request.priority)}>
                        {getPriorityLabel(request.priority)}
                      </Badge>
                    </div>
                  </div>
                  
                  {request.resolution_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm">
                        <strong>Réponse:</strong> {request.resolution_notes}
                      </p>
                      {request.resolved_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Résolu le {format(new Date(request.resolved_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RechargeRequest;