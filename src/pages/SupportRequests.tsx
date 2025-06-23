import React, { useState } from 'react';
import { useSupportTickets, useCreateSupportTicket, useTicketComments, useAddTicketComment } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SupportRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les tickets
  const { tickets, isLoading, refetch } = useSupportTickets({
    status: statusFilter === 'all' ? undefined : statusFilter,
    ticket_type: typeFilter === 'all' ? undefined : typeFilter,
  });
  
  const createTicket = useCreateSupportTicket();
  
  // États pour les formulaires
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticket_type: 'support',
    priority: 'medium'
  });

  // Hook pour les commentaires du ticket sélectionné
  const { comments = [], refetch: refetchComments } = useTicketComments(selectedTicket?.id || '');
  const addComment = useAddTicketComment();

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTicket.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        ticket_type: formData.ticket_type,
        priority: formData.priority,
      });

      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été soumise avec succès",
      });

      setFormData({
        title: '',
        description: '',
        ticket_type: 'support',
        priority: 'medium'
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le ticket de support",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    try {
      await addComment.mutateAsync({
        ticketId: selectedTicket.id,
        commentText: newComment.trim(),
        isInternal: false,
      });

      setNewComment('');
      refetchComments();
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été ajouté au ticket",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    }
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
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'support': return 'Support Technique';
      case 'recharge': return 'Demande de Recharge';
      case 'complaint': return 'Réclamation';
      case 'feature_request': return 'Demande de Fonctionnalité';
      default: return type;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requêtes Support</h1>
          <p className="text-gray-600">Gérez vos demandes de support et assistance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de demande *
                </label>
                <Select 
                  value={formData.ticket_type} 
                  onValueChange={(value) => setFormData({ ...formData, ticket_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Support Technique</SelectItem>
                    <SelectItem value="complaint">Réclamation</SelectItem>
                    <SelectItem value="feature_request">Demande de Fonctionnalité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Résumé de votre demande"
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
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre problème ou demande en détail..."
                  rows={6}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Créer le Ticket
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-blue-600">{tickets.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ouverts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Tickets de Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par titre, description ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouverts</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="closed">Fermés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="support">Support Technique</SelectItem>
                <SelectItem value="complaint">Réclamations</SelectItem>
                <SelectItem value="feature_request">Demandes de Fonctionnalité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des tickets */}
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Aucun ticket trouvé avec ces filtres' 
                : 'Aucun ticket de support créé'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{ticket.title}</h4>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>#{ticket.ticket_number}</span>
                        <span>{getTypeLabel(ticket.ticket_type)}</span>
                        <span>
                          {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        {ticket.assigned_to && (
                          <Badge variant="outline">
                            Assigné à: {ticket.assigned_to.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Ticket #{selectedTicket?.ticket_number}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedTicket && (
                            <Tabs defaultValue="details" className="space-y-4">
                              <TabsList>
                                <TabsTrigger value="details">Détails</TabsTrigger>
                                <TabsTrigger value="comments">
                                  Commentaires ({comments.length})
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">{selectedTicket.title}</h4>
                                  <p className="text-gray-600 mb-4">{selectedTicket.description}</p>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Type:</span> {getTypeLabel(selectedTicket.ticket_type)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Priorité:</span> {getPriorityLabel(selectedTicket.priority)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Statut:</span> {getStatusLabel(selectedTicket.status)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Créé le:</span> {format(new Date(selectedTicket.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                    </div>
                                  </div>
                                </div>
                                
                                {selectedTicket.resolution_notes && (
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-green-800 mb-2">Résolution:</h5>
                                    <p className="text-green-700">{selectedTicket.resolution_notes}</p>
                                    {selectedTicket.resolved_at && (
                                      <p className="text-xs text-green-600 mt-2">
                                        Résolu le {format(new Date(selectedTicket.resolved_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="comments" className="space-y-4">
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                  {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-sm">
                                          {comment.profiles?.name || 'Utilisateur'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.comment_text}</p>
                                    </div>
                                  ))}
                                  
                                  {comments.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                      Aucun commentaire encore
                                    </div>
                                  )}
                                </div>
                                
                                {selectedTicket.status !== 'closed' && (
                                  <div className="flex gap-2">
                                    <Textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Ajouter un commentaire..."
                                      rows={3}
                                      className="flex-1"
                                    />
                                    <Button 
                                      onClick={handleAddComment}
                                      disabled={!newComment.trim()}
                                      className="self-end"
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
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

export default SupportRequests;
