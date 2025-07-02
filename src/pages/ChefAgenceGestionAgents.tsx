import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, UserX, Search, RefreshCw, Users, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAgents, useToggleAgentStatus } from "@/hooks/useAgents";
import { useCreateAgent } from "@/hooks/useUserCreation";
import { CreateAgentSchema, type CreateAgentValues } from "@/lib/schemas";
import { UserCreationForm } from "@/components/forms/UserCreationForm";

const ChefAgenceGestionAgents = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks pour les données
  const { data: agents = [], isLoading, error, refetch } = useAgents();
  const toggleAgent = useToggleAgentStatus();
  const createAgentMutation = useCreateAgent();

  // Filtrage des agents
  const filteredAgents = agents.filter((agent: any) => {
    if (!searchTerm) return true;
    return (
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Gestion de la création
  const handleCreateAgent = async (values: CreateAgentValues) => {
    try {
      await createAgentMutation.mutateAsync(values);
      setModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      return { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  // Gestion du toggle de statut
  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await toggleAgent.mutateAsync({ userId, isActive: !isActive });
      toast({ 
        title: "Statut modifié", 
        description: `L'agent a été ${!isActive ? "activé" : "suspendu"}.` 
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: error instanceof Error ? error.message : 'Erreur lors de la modification du statut', 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Agents</h1>
          <p className="text-gray-600">
            Créez et gérez les agents de votre agence: {user?.agenceName || 'Votre agence'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouvel Agent</DialogTitle>
              </DialogHeader>
              <UserCreationForm
                schema={CreateAgentSchema}
                onSubmit={handleCreateAgent}
                userType="agent"
                isLoading={createAgentMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Informations sur l'agence */}
      {user?.agenceName && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{user.agenceName}</h3>
                <p className="text-sm text-blue-700">Vous gérez les agents de cette agence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter((agent: any) => agent.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {agents.filter((agent: any) => !agent.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Suspendus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {agents.filter((agent: any) => agent.balance > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Avec Solde</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des Agents
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou identifiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Chargement des agents...
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-600 text-sm mb-4">{error.message}</div>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              {searchTerm ? (
                <>
                  <p>Aucun agent trouvé pour "{searchTerm}"</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchTerm("")} 
                    className="mt-2"
                  >
                    Effacer la recherche
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Users className="h-12 w-12 text-gray-300 mx-auto" />
                  <p>Aucun agent dans votre agence pour le moment</p>
                  <Button onClick={() => setModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer le premier agent
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière Connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent: any) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="font-mono text-sm">{agent.email}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${agent.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {agent.balance?.toLocaleString('fr-FR') || '0'} FCFA
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={agent.is_active ? "default" : "secondary"}
                          className={agent.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {agent.is_active ? "Actif" : "Suspendu"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {agent.last_login ? 
                          new Date(agent.last_login).toLocaleDateString('fr-FR') : 
                          'Jamais connecté'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={agent.is_active ? "Suspendre" : "Réactiver"}
                            onClick={() => handleToggleStatus(agent.user_id, agent.is_active)}
                            disabled={toggleAgent.isPending}
                          >
                            <UserX className="h-4 w-4" />
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

      {/* Instructions en bas de page */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            📋 Instructions pour les Agents
          </h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Utilisez le format: <code className="bg-green-100 px-1 rounded">codeagence.prénom</code> (ex: dkr01.fatou)</li>
            <li>• Les agents peuvent créer des opérations et gérer leurs transactions</li>
            <li>• Ils sont automatiquement assignés à votre agence</li>
            <li>• L'identifiant ne peut pas être modifié après création</li>
            <li>• Vous pouvez suspendre/réactiver un agent à tout moment</li>
            <li>• Les agents suspendus ne peuvent plus se connecter au système</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChefAgenceGestionAgents;