
import React, { useState } from 'react';
import { useSousAdmins, useCreateSousAdmin } from '@/hooks/useSousAdmins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CreateSousAdminSchema, CreateSousAdminValues } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Edit, UserPlus } from 'lucide-react';

const AdminGestionSousAdmins = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: sousAdmins = [], isLoading, refetch } = useSousAdmins();
  const createSousAdminMutation = useCreateSousAdmin();
  const { toast } = useToast();

  const form = useForm<CreateSousAdminValues>({
    resolver: zodResolver(CreateSousAdminSchema),
    defaultValues: {
      fullName: '',
      identifier: '',
      initialPassword: '',
    },
  });

  const onSubmit = async (values: CreateSousAdminValues) => {
    try {
      // Ensure all required fields are provided
      if (!values.fullName || !values.identifier || !values.initialPassword) {
        toast({
          title: "Erreur de validation",
          description: "Tous les champs sont requis",
          variant: "destructive",
        });
        return;
      }

      await createSousAdminMutation.mutateAsync(values);
      toast({
        title: "Succès",
        description: "Sous-administrateur créé avec succès",
      });
      form.reset();
      setShowCreateForm(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating sous admin:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du sous-administrateur",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Sous-Administrateurs</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Annuler' : 'Créer Sous-Admin'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Créer un nouveau Sous-Administrateur</CardTitle>
            <CardDescription>
              Créez un compte sous-administrateur pour assister dans la gestion du système.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Ex: Marie Martin"
                  required
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="identifier">Identifiant *</Label>
                <Input
                  id="identifier"
                  {...form.register('identifier')}
                  placeholder="Ex: sadmin.martin"
                  required
                />
                {form.formState.errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="initialPassword">Mot de passe initial *</Label>
                <Input
                  id="initialPassword"
                  type="password"
                  {...form.register('initialPassword')}
                  placeholder="Mot de passe temporaire"
                  required
                />
                {form.formState.errors.initialPassword && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.initialPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createSousAdminMutation.isPending}>
                  {createSousAdminMutation.isPending ? 'Création...' : 'Créer Sous-Admin'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des Sous-Administrateurs</CardTitle>
          <CardDescription>
            Gérez les comptes des sous-administrateurs dans le système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(sousAdmins) && sousAdmins.length > 0 ? (
            <div className="space-y-4">
              {sousAdmins.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{admin.name}</h3>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <Badge variant={admin.is_active ? "default" : "secondary"}>
                      {admin.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucun sous-administrateur trouvé.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGestionSousAdmins;
