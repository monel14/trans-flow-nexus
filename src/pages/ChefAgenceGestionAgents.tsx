
import React, { useState } from 'react';
import { useAgents, useCreateAgent } from '@/hooks/useAgents';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CreateAgentSchema, CreateAgentValues } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Edit, UserPlus } from 'lucide-react';

const ChefAgenceGestionAgents = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: profile } = useProfile();
  const { data: agents = [], isLoading, refetch } = useAgents();
  const createAgentMutation = useCreateAgent();
  const { toast } = useToast();

  const form = useForm<CreateAgentValues>({
    resolver: zodResolver(CreateAgentSchema),
    defaultValues: {
      fullName: '',
      identifier: '',
      initialPassword: '',
      agencyId: profile?.agency_id || 0,
    },
  });

  const onSubmit = async (values: CreateAgentValues) => {
    try {
      // Ensure all required fields are provided and agencyId is set
      const agencyId = profile?.agency_id;
      if (!values.fullName || !values.identifier || !values.initialPassword || !agencyId) {
        toast({
          title: "Erreur de validation",
          description: "Tous les champs sont requis et vous devez être assigné à une agence",
          variant: "destructive",
        });
        return;
      }

      // Map form values to the expected API format
      const apiValues = {
        name: values.fullName,
        email: values.identifier,
        password: values.initialPassword,
        agency_id: agencyId
      };

      await createAgentMutation.mutateAsync(apiValues);
      toast({
        title: "Succès",
        description: "Agent créé avec succès",
      });
      form.reset();
      setShowCreateForm(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'agent",
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
        <h1 className="text-3xl font-bold">Gestion des Agents</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Annuler' : 'Créer Agent'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Créer un nouvel Agent</CardTitle>
            <CardDescription>
              Créez un compte agent pour votre agence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Ex: Pierre Diallo"
                  required
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="identifier">Email *</Label>
                <Input
                  id="identifier"
                  type="email"
                  {...form.register('identifier')}
                  placeholder="Ex: pierre.diallo@transflow.com"
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
                <Button type="submit" disabled={createAgentMutation.isPending}>
                  {createAgentMutation.isPending ? 'Création...' : 'Créer Agent'}
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
          <CardTitle>Liste des Agents</CardTitle>
          <CardDescription>
            Gérez les agents de votre agence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(agents) && agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={agent.is_active ? "default" : "secondary"}>
                        {agent.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        Solde: {agent.balance || 0} XOF
                      </Badge>
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
              Aucun agent trouvé.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChefAgenceGestionAgents;
