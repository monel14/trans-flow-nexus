import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useOperationTypes, 
  useCreateOperationType, 
  useUpdateOperationType,
  OperationType 
} from '@/hooks/useOperationTypes';

// Schema de validation adapté à la structure existante
const operationTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  impacts_balance: z.boolean(),
  status: z.enum(['active', 'inactive', 'archived']),
});

type OperationTypeFormData = z.infer<typeof operationTypeSchema>;

const OperationTypeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();

  const form = useForm<OperationTypeFormData>({
    resolver: zodResolver(operationTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      impacts_balance: false,
      status: 'active',
    },
  });

  // Charger les données si on édite
  useEffect(() => {
    if (isEditing) {
      // TODO: Charger les données du type d'opération depuis l'API
      setIsLoading(true);
      // Simulation de chargement
      setTimeout(() => {
        const mockData = {
          name: 'Virement Test',
          description: 'Type de virement pour test',
          impacts_balance: true,
          status: 'active' as const,
        };
        form.reset(mockData);
        setIsLoading(false);
      }, 1000);
    }
  }, [isEditing, form]);

  const onSubmit = async (data: OperationTypeFormData) => {
    setIsLoading(true);
    setSaveError(null);
    
    try {
      if (isEditing && id) {
        await updateOperationType.mutateAsync({
          id,
          updates: data
        });
      } else {
        await createOperationType.mutateAsync({
          ...data,
          is_active: data.status === 'active',
        } as any);
      }
      
      navigate('/operation-types');
    } catch (error) {
      setSaveError('Erreur lors de la sauvegarde');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/operation-types')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Éditer le Type d\'Opération' : 'Créer un Type d\'Opération'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Modifier les paramètres du type d\'opération' : 'Définir un nouveau type d\'opération'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Type d'Opération*</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Ex: Virement, Dépôt, Retrait..."
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Description détaillée de ce type d'opération..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="impacts_balance"
                checked={form.watch('impacts_balance')}
                onCheckedChange={(checked) => form.setValue('impacts_balance', checked)}
              />
              <Label htmlFor="impacts_balance" className="text-sm font-medium">
                Cette opération affecte le solde de l'agent
              </Label>
            </div>
            {form.watch('impacts_balance') && (
              <div className="ml-6 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                ⚠️ Les opérations de ce type modifieront automatiquement le solde de l'agent qui les effectue
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations sur les champs et commissions */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">Configuration avancée disponible après création</p>
              <p className="text-sm">
                Les champs dynamiques et les règles de commission pourront être configurés 
                une fois ce type d'opération créé.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {saveError}
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/operation-types')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading || createOperationType.isPending || updateOperationType.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading || createOperationType.isPending || updateOperationType.isPending ? (
                  <>Sauvegarde...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Mettre à jour' : 'Créer'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default OperationTypeFormPage;