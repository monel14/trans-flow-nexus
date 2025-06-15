
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, UserCheck, UserX, History, RotateCcw } from 'lucide-react';
import { useAgents, useCreateAgent, useToggleAgent } from '@/hooks/useAgents';

const AgentManagement = () => {
  const { toast } = useToast();
  const { data: agents = [], isLoading, error } = useAgents();
  const createAgent = useCreateAgent();
  const toggleAgent = useToggleAgent();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'agent123'
  });

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAgent.mutateAsync({
        name: newAgent.name,
        email: newAgent.email,
        password: newAgent.password,
        phone: newAgent.phone,
        agency_id: 1, // TODO: récupérer l'agence du chef connecté
      });

      toast({
        title: "Agent créé",
        description: `Le compte agent pour ${newAgent.name} a été créé avec succès.`,
      });

      setNewAgent({ name: '', email: '', phone: '', password: 'agent123' });
      setIsCreateModalOpen(false);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleAgent.mutateAsync({ user_id: userId, is_active: !currentStatus });
      const newStatus = !currentStatus ? 'activé' : 'suspendu';
      toast({
        title: "Statut modifié",
        description: `L'agent a été ${newStatus}.`,
      });
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive"
      });
    }
  };

  // Calculer les statistiques à partir des données réelles
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent: any) => agent.is_active).length;
  const suspendedAgents = totalAgents - activeAgents;
  const totalBalance = agents.reduce((sum: number, agent: any) => sum + (agent.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Agents</h1>
          <p className="text-gray-600">Gérez les agents de votre agence</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Compte Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom Complet *</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom et prénom"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+226 XX XX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe initial</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mot de passe par défaut"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCreateAgent} 
                  className="flex-1"
                  disabled={createAgent.isPending}
                >
                  {createAgent.isPending ? 'Création...' : 'Créer le Compte'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAgents}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeAgents}</div>
              <div className="text-sm text-gray-600">Agents Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalBalance.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Solde Total FCFA</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{suspendedAgents}</div>
              <div className="text-sm text-gray-600">Suspendus</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des agents */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-600">Chargement des agents...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 text-sm">{error.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date Création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent: any) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.user_id?.slice(0, 8) || 'N/A'}</TableCell>
                      <TableCell>{agent.name || 'N/A'}</TableCell>
                      <TableCell>{agent.email || 'N/A'}</TableCell>
                      <TableCell>{agent.agencies?.name || 'Aucune'}</TableCell>
                      <TableCell>{getStatusBadge(agent.is_active)}</TableCell>
                      <TableCell>{new Date(agent.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={agent.is_active ? 'Suspendre' : 'Réactiver'}
                            onClick={() => handleToggleStatus(agent.user_id, agent.is_active)}
                            disabled={toggleAgent.isPending}
                          >
                            {agent.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" title="Historique">
                            <History className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Réinitialiser MDP">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentManagement;
