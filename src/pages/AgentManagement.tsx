
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

const AgentManagement = () => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    initialBalance: ''
  });

  // Données mockées
  const agents = [
    {
      id: 'AGT001',
      name: 'Ousmane Kaboré',
      email: 'ousmane@agence.com',
      phone: '+226 70 XX XX XX',
      balance: 125000,
      status: 'Actif',
      createdDate: '2024-01-10',
      lastActivity: '2024-01-15 14:30'
    },
    {
      id: 'AGT002',
      name: 'Aminata Traoré',
      email: 'aminata@agence.com',
      phone: '+226 75 XX XX XX',
      balance: 85000,
      status: 'Actif',
      createdDate: '2024-01-08',
      lastActivity: '2024-01-15 10:15'
    },
    {
      id: 'AGT003',
      name: 'Ibrahim Sawadogo',
      email: 'ibrahim@agence.com',
      phone: '+226 76 XX XX XX',
      balance: 45000,
      status: 'Suspendu',
      createdDate: '2024-01-05',
      lastActivity: '2024-01-12 16:45'
    }
  ];

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.email || !newAgent.phone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Agent créé",
      description: `Le compte agent pour ${newAgent.name} a été créé avec succès.`,
    });

    setNewAgent({ name: '', email: '', phone: '', initialBalance: '' });
    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    return status === 'Actif' 
      ? <Badge className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
  };

  const handleToggleStatus = (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';
    toast({
      title: "Statut modifié",
      description: `L'agent a été ${newStatus.toLowerCase()}.`,
    });
  };

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
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+226 XX XX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="initialBalance">Solde Initial (FCFA)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  value={newAgent.initialBalance}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, initialBalance: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateAgent} className="flex-1">
                  Créer le Compte
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Agents Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">255,000</div>
              <div className="text-sm text-gray-600">Solde Total FCFA</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1</div>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Solde Actuel</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date Création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.id}</TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell className="font-medium">
                      {agent.balance.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>{agent.createdDate}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title={agent.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                        >
                          {agent.status === 'Actif' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentManagement;
