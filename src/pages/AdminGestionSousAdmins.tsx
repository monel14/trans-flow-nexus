import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, UserX, Search, RefreshCw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSousAdmins, useToggleSousAdminStatus } from "@/hooks/useSousAdmins";
import { useCreateSousAdmin } from "@/hooks/useUserCreation";
import { CreateSousAdminSchema, type CreateSousAdminValues } from "@/lib/schemas";
import { UserCreationForm } from "@/components/forms/UserCreationForm";

const AdminGestionSousAdmins = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks pour les données
  const { data: sousAdmins = [], isLoading, error, refetch } = useSousAdmins();
  const toggleSousAdmin = useToggleSousAdminStatus();
  const createSousAdminMutation = useCreateSousAdmin();

  // Filtrage des sous-admins
  const filteredSousAdmins = sousAdmins.filter((admin: any) => {
    if (!searchTerm) return true;
    return (
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Gestion de la création
  const handleCreateSousAdmin = async (values: CreateSousAdminValues) => {
    try {
      await createSousAdminMutation.mutateAsync(values);
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
      await toggleSousAdmin.mutateAsync({ userId, isActive: !isActive });
      toast({ 
        title: "Statut modifié", 
        description: `Le sous-admin a été ${!isActive ? "activé" : "suspendu"}.` 
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Sous-Administrateurs</h1>
          <p className="text-gray-600">Créez et gérez les sous-administrateurs du système</p>
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
                Nouveau Sous-Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau Sous-Administrateur</DialogTitle>
              </DialogHeader>
              <UserCreationForm
                schema={CreateSousAdminSchema}
                onSubmit={handleCreateSousAdmin}
                userType="sous_admin"
                isLoading={createSousAdminMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{sousAdmins.length}</div>
            <p className="text-xs text-muted-foreground">Total Sous-Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {sousAdmins.filter((admin: any) => admin.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {sousAdmins.filter((admin: any) => !admin.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Suspendus</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sous-Administrateurs</CardTitle>
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
              Chargement des sous-administrateurs...
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-600 text-sm mb-4">{error.message}</div>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          ) : filteredSousAdmins.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              {searchTerm ? (
                <>
                  <p>Aucun sous-admin trouvé pour "{searchTerm}"</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchTerm("")} 
                    className="mt-2"
                  >
                    Effacer la recherche
                  </Button>
                </>
              ) : (
                <p>Aucun sous-administrateur créé pour le moment</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSousAdmins.map((admin: any) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell className="font-mono text-sm">{admin.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Sous-Administrateur</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={admin.is_active ? "default" : "secondary"}
                          className={admin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {admin.is_active ? "Actif" : "Suspendu"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={admin.is_active ? "Suspendre" : "Réactiver"}
                            onClick={() => handleToggleStatus(admin.user_id, admin.is_active)}
                            disabled={toggleSousAdmin.isPending}
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
            📋 Instructions pour les Sous-Administrateurs
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Utilisez le format: <code className="bg-blue-100 px-1 rounded">sadmin.prénom</code> (ex: sadmin.pierre)</li>
            <li>• Les sous-admins ont accès à la validation des transactions</li>
            <li>• Ils peuvent gérer le support client et certaines opérations système</li>
            <li>• L'identifiant ne peut pas être modifié après création</li>
            <li>• Les permissions peuvent être configurées individuellement (fonctionnalité future)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGestionSousAdmins;