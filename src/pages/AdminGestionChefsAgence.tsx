import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, UserX, Edit, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChefsAgence, useToggleChefAgenceStatus } from "@/hooks/useChefsAgence";
import { useCreateChefAgence, useAgencies } from "@/hooks/useUserCreation";
import { CreateChefAgenceSchema, type CreateChefAgenceValues } from "@/lib/schemas";
import { UserCreationForm } from "@/components/forms/UserCreationForm";

const AdminGestionChefsAgence = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks pour les données
  const { data: chefs = [], isLoading, error, refetch } = useChefsAgence();
  const { data: agencies = [], isLoading: agenciesLoading } = useAgencies();
  const toggleChef = useToggleChefAgenceStatus();
  const createChefMutation = useCreateChefAgence();

  // Filtrage des chefs d'agence
  const filteredChefs = chefs.filter((chef: any) => {
    if (!searchTerm) return true;
    return (
      chef.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Gestion de la création
  const handleCreateChef = async (values: CreateChefAgenceValues) => {
    try {
      await createChefMutation.mutateAsync(values);
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
      await toggleChef.mutateAsync({ userId, isActive: !isActive });
      toast({ 
        title: "Statut modifié", 
        description: `Le chef a été ${!isActive ? "activé" : "suspendu"}.` 
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chefs d'Agence</h1>
          <p className="text-gray-600">Créez et gérez les responsables des agences</p>
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
                Nouveau Chef d'Agence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau Chef d'Agence</DialogTitle>
              </DialogHeader>
              <UserCreationForm
                schema={CreateChefAgenceSchema}
                onSubmit={handleCreateChef}
                userType="chef_agence"
                agencies={agencies}
                isLoading={createChefMutation.isPending || agenciesLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{chefs.length}</div>
            <p className="text-xs text-muted-foreground">Total Chefs d'Agence</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {chefs.filter((chef: any) => chef.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {chefs.filter((chef: any) => !chef.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Suspendus</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Chefs d'Agence</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, identifiant ou agence..."
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
              Chargement des chefs d'agence...
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-600 text-sm mb-4">{error.message}</div>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          ) : filteredChefs.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              {searchTerm ? (
                <>
                  <p>Aucun chef d'agence trouvé pour "{searchTerm}"</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchTerm("")} 
                    className="mt-2"
                  >
                    Effacer la recherche
                  </Button>
                </>
              ) : (
                <p>Aucun chef d'agence créé pour le moment</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChefs.map((chef: any) => (
                    <TableRow key={chef.id}>
                      <TableCell className="font-medium">{chef.name}</TableCell>
                      <TableCell className="font-mono text-sm">{chef.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{chef.agencies?.name || "-"}</span>
                          {chef.agencies?.code && (
                            <span className="text-xs text-gray-500">Code: {chef.agencies.code}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={chef.is_active ? "default" : "secondary"}
                          className={chef.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {chef.is_active ? "Actif" : "Suspendu"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={chef.is_active ? "Suspendre" : "Réactiver"}
                            onClick={() => handleToggleStatus(chef.user_id, chef.is_active)}
                            disabled={toggleChef.isPending}
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            📋 Instructions pour les Chefs d'Agence
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Utilisez le format: <code className="bg-blue-100 px-1 rounded">chef.ville.nom</code> (ex: chef.dakar.diallo)</li>
            <li>• Le chef aura accès à la gestion de son agence et à la création d'agents</li>
            <li>• L'identifiant ne peut pas être modifié après création</li>
            <li>• Chaque agence ne peut avoir qu'un seul chef actif</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGestionChefsAgence;