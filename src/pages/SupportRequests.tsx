import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportTickets, useAssignTicket, useResolveTicket } from '@/hooks/useSupportTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  UserPlus, 
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  User,
  CreditCard,
  Bug,
  Lightbulb,
  Settings
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const SupportRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État des modales
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [actionType, setActionType] = useState<'assign' | 'resolve' | 'respond' | null>(null);
  const [responseText, setResponseText] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hooks
  const { data: tickets = [], isLoading } = useSupportTickets();
  const assignTicket = useAssignTicket();
  const resolveTicket = useResolveTicket();

  const getStatusBadge = (status: string) => {
    const variants = {
      'open': 'bg-blue-100 text-blue-800 border-blue-300',
      'assigned': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in_progress': 'bg-orange-100 text-orange-800 border-orange-300',
      'pending_user': 'bg-purple-100 text-purple-800 border-purple-300',
      'resolved': 'bg-green-100 text-green-800 border-green-300',
      'closed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const labels = {
      'open': 'Ouvert',
      'assigned': 'Assigné',
      'in_progress': 'En cours',
      'pending_user': 'Attente utilisateur',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.open}>
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

  const getTypeIcon = (type: string) => {
    const icons = {
      'recharge_request': CreditCard,
      'technical_issue': Bug,
      'feature_request': Lightbulb,
      'account_issue': User,
      'general_inquiry': MessageSquare,
      'system_config': Settings
    };
    
    const Icon = icons[type as keyof typeof icons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'recharge_request': 'Demande de Crédit',
      'technical_issue': 'Problème Technique',
      'feature_request': 'Demande de Fonctionnalité',
      'account_issue': 'Problème de Compte',
      'general_inquiry': 'Question Générale',
      'system_config': 'Configuration Système'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  const handleAssign = (ticket: any) => {
    setSelectedTicket(ticket);
    setActionType('assign');
  };

  const handleResolve = (ticket: any) => {
    setSelectedTicket(ticket);
    setActionType('resolve');
    setResponseText('');
  };

  const handleRespond = (ticket: any) => {
    setSelectedTicket(ticket);
    setActionType('respond');
    setResponseText('');
  };

  const processAction = async () => {
    if (!selectedTicket || !actionType) return;

    setIsProcessing(true);
    
    try {
      switch (actionType) {
        case 'assign':
          if (!assigneeId) {
            toast({
              title: "Erreur",
              description: "Veuillez sélectionner un assigné",
              variant: "destructive"
            });
            return;
          }
          await assignTicket.mutateAsync({
            ticketId: selectedTicket.id,
            assigneeId
          });
          toast({
            title: "Ticket assigné",
            description: "Le ticket a été assigné avec succès",
          });
          break;

        case 'resolve':
          if (!responseText.trim()) {
            toast({
              title: "Erreur",
              description: "Veuillez ajouter une réponse",
              variant: "destructive"
            });
            return;
          }
          await resolveTicket.mutateAsync({
            ticketId: selectedTicket.id,
            response: responseText,
            status: 'resolved'
          });
          toast({
            title: "Ticket résolu",
            description: "Le ticket a été marqué comme résolu",
          });
          break;

        case 'respond':
          if (!responseText.trim()) {
            toast({
              title: "Erreur",
              description: "Veuillez saisir une réponse",
              variant: "destructive"
            });
            return;
          }
          await resolveTicket.mutateAsync({
            ticketId: selectedTicket.id,
            response: responseText,
            status: newStatus || 'in_progress'
          });
          toast({
            title: "Réponse envoyée",
            description: "Votre réponse a été envoyée à l'utilisateur",
          });
          break;
      }
      
      // Fermer la modale
      setSelectedTicket(null);
      setActionType(null);
      setResponseText('');
      setAssigneeId('');
      setNewStatus('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement",
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
          <p>Chargement des requêtes...</p>
        </div>
      </div>
    );
  }

  const unassignedTickets = tickets.filter(t => !t.assigned_to_id && t.status === 'open');
  const myTickets = tickets.filter(t => t.assigned_to_id === user?.id);
  const allTickets = tickets.filter(t => t.assigned_to_id && t.assigned_to_id !== user?.id);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Gestion des Requêtes Support
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez et traitez toutes les demandes des utilisateurs
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {unassignedTickets.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Non Assignées
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {myTickets.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <UserPlus className="h-4 w-4" />
                Mes Tickets
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tickets.filter(t => t.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Urgents
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Résolus
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes files */}
      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Non Assignées ({unassignedTickets.length})</span>
          </TabsTrigger>
          <TabsTrigger value="my-tickets" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Mes Tickets ({myTickets.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all-tickets">
            Tous les Tickets ({allTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>Requêtes Non Assignées</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTable 
                tickets={unassignedTickets} 
                showAssignActions={true}
                onAssign={handleAssign}
                onResolve={handleResolve}
                onRespond={handleRespond}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tickets">
          <Card>
            <CardHeader>
              <CardTitle>Mes Tickets en Cours</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTable 
                tickets={myTickets} 
                showAssignActions={false}
                onAssign={handleAssign}
                onResolve={handleResolve}
                onRespond={handleRespond}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-tickets">
          <Card>
            <CardHeader>
              <CardTitle>Tous les Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTable 
                tickets={allTickets} 
                showAssignActions={user?.role === 'admin_general'}
                onAssign={handleAssign}
                onResolve={handleResolve}
                onRespond={handleRespond}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales de traitement */}
      {/* ... (autres modales similaires au code précédent) ... */}
    </div>
  );
};

// Composant TicketTable
const TicketTable = ({ tickets, showAssignActions, onAssign, onResolve, onRespond }: any) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'open': 'bg-blue-100 text-blue-800 border-blue-300',
      'assigned': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in_progress': 'bg-orange-100 text-orange-800 border-orange-300',
      'pending_user': 'bg-purple-100 text-purple-800 border-purple-300',
      'resolved': 'bg-green-100 text-green-800 border-green-300',
      'closed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const labels = {
      'open': 'Ouvert',
      'assigned': 'Assigné',
      'in_progress': 'En cours',
      'pending_user': 'Attente utilisateur',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.open}>
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

  const getTypeLabel = (type: string) => {
    const labels = {
      'recharge_request': 'Demande de Crédit',
      'technical_issue': 'Problème Technique',
      'feature_request': 'Demande de Fonctionnalité',
      'account_issue': 'Problème de Compte',
      'general_inquiry': 'Question Générale',
      'system_config': 'Configuration Système'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Aucun ticket trouvé</h3>
        <p>Cette section sera mise à jour automatiquement</p>
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
            <TableHead>Utilisateur</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sujet</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Assigné à</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket: any) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-xs">
                #{ticket.id.slice(-6)}
              </TableCell>
              <TableCell>
                {formatDate(ticket.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{ticket.profiles?.name}</span>
                  <span className="text-sm text-gray-500">{ticket.profiles?.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {getTypeLabel(ticket.ticket_type)}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate font-medium" title={ticket.subject}>
                  {ticket.subject}
                </p>
                <p className="text-sm text-gray-500 truncate" title={ticket.description}>
                  {ticket.description}
                </p>
              </TableCell>
              <TableCell>
                {getPriorityBadge(ticket.priority)}
              </TableCell>
              <TableCell>
                {getStatusBadge(ticket.status)}
              </TableCell>
              <TableCell>
                {ticket.assigned_profiles?.name || 'Non assigné'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {showAssignActions && !ticket.assigned_to_id && (
                    <Button size="sm" variant="outline" onClick={() => onAssign(ticket)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onRespond(ticket)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => onResolve(ticket)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupportRequests;