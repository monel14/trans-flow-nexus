
import React, { useState } from 'react';
import { useAgencies } from '@/hooks/useAgencies';
import { useChefsAgence, useCreateChefAgence } from '@/hooks/useChefsAgence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CreateChefAgenceSchema, CreateChefAgenceValues } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Edit, UserPlus } from 'lucide-react';

const AdminGestionChefsAgence = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: agencies = [], isLoading: agenciesLoading } = useAgencies();
  const { data: chefsAgence = [], isLoading: chefsLoading, refetch } = useChefsAgence();
  const createChefMutation = useCreateChefAgence();
  const { toast } = useToast();

  const form = useForm<CreateChefAgenceValues>({
    resolver: zodResolver(CreateChefAgenceSchema),
    defaultValues: {
      fullName: '',
      identifier: '',
      initialPassword: '',
      agencyId: undefined,
    },
  });

  const onSubmit = async (values: CreateChefAgenceValues) => {
    try {
      // Ensure all required fields are provided
      if (!values.fullName || !values.identifier || !values.initialPassword || !values.agencyId) {
        toast({
          title: "Erreur de validation",
          description: "Tous les champs sont requis",
          variant: "destructive",
        });
        return;
      }

      await createChefMutation.mutateAsync(values);
      toast({
        title: "Succès",
        description: "Chef d'agence créé avec succès",
      });
      form.reset();
      setShowCreateForm(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating chef agence:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du chef d'agence",
        variant: "destructive",
      });
    }
  };

  if (agenciesLoading || chefsLoading) {
    return <div>Chargement...</div>;
  }

  // Transform agencies data to match expected format
  const transformedAgencies = Array.isArray(agencies) ? agencies.map(agency => ({
    id: agency.id,
    name: agency.name,
    code: `AG${agency.id.toString().padStart(3, '0')}`, // Generate code from ID
    city: agency.city || ''
  })) : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Chefs d'Agence</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Annuler' : 'Créer Chef d\'Agence'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Créer un nouveau Chef d'Agence</CardTitle>
            <CardDescription>
              Créez un compte chef d'agence pour gérer une agence spécifique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Ex: Jean Dupont"
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
                  placeholder="Ex: chef.dakar.dupont"
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

              <div>
                <Label htmlFor="agencyId">Agence *</Label>
                <Select 
                  onValueChange={(value) => form.setValue('agencyId', parseInt(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une agence" />
                  </SelectTrigger>
                  <SelectContent>
                    {transformedAgencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id.toString()}>
                        {agency.name} - {agency.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.agencyId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.agencyId.message}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createChefMutation.isPending}>
                  {createChefMutation.isPending ? 'Création...' : 'Créer Chef d\'Agence'}
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
          <CardTitle>Liste des Chefs d'Agence</CardTitle>
          <CardDescription>
            Gérez les comptes des chefs d'agence dans le système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(chefsAgence) && chefsAgence.length > 0 ? (
            <div className="space-y-4">
              {chefsAgence.map((chef: any) => (
                <div key={chef.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{chef.name}</h3>
                    <p className="text-sm text-gray-500">{chef.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={chef.is_active ? "default" : "secondary"}>
                        {chef.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      {chef.agencies && (
                        <Badge variant="outline">
                          {chef.agencies.name}
                        </Badge>
                      )}
                    </div>
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
              Aucun chef d'agence trouvé.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGestionChefsAgence;
