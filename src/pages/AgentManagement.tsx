
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAgents, useCreateAgent, useToggleAgentStatus } from "@/hooks/useAgents";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, UserPlus, Users, UserCheck, UserX } from "lucide-react";

const AgentManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: agents = [], isLoading, error } = useAgents();
  const createAgentMutation = useCreateAgent();
  const toggleStatusMutation = useToggleAgentStatus();

  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showForm, setShowForm] = useState(false);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgent.name || !newAgent.email || !newAgent.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAgentMutation.mutateAsync({
        name: newAgent.name,
        email: newAgent.email,
        password: newAgent.password,
        phone: newAgent.phone || undefined,
      });

      toast({
        title: "Succès",
        description: "Agent créé avec succès",
      });

      setNewAgent({ name: "", email: "", password: "", phone: "" });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({
        userId,
        isActive: !currentStatus,
      });

      toast({
        title: "Succès",
        description: `Agent ${!currentStatus ? "activé" : "désactivé"} avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la modification",
        variant: "destructive",
      });
    }
  };

  const activeAgents = agents.filter((agent: any) => agent.is_active);
  const inactiveAgents = agents.filter((agent: any) => !agent.is_active);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Erreur: {error instanceof Error ? error.message : "Erreur inconnue"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Agents</h1>
          <p className="text-gray-600 mt-1">
            Agence: {user?.agenceName || "Non définie"}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel Agent
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-gray-600">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{activeAgents.length}</p>
                <p className="text-sm text-gray-600">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{inactiveAgents.length}</p>
                <p className="text-sm text-gray-600">Inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouvel Agent</CardTitle>
            <CardDescription>
              Ajoutez un nouveau membre à votre équipe d'agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="jean.dupont@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createAgentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'Agent"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des agents */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Agents</CardTitle>
          <CardDescription>
            Gérez les agents de votre agence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Chargement des agents...</span>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun agent trouvé</p>
              <p className="text-sm">Créez votre premier agent pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.email}</p>
                        {agent.phone && (
                          <p className="text-sm text-gray-500">{agent.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                      {agent.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`toggle-${agent.id}`} className="text-sm">
                        {agent.is_active ? "Désactiver" : "Activer"}
                      </Label>
                      <Switch
                        id={`toggle-${agent.id}`}
                        checked={agent.is_active}
                        onCheckedChange={() => handleToggleStatus(agent.id, agent.is_active)}
                        disabled={toggleStatusMutation.isPending}
                      />
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

export default AgentManagement;
