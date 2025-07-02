import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, ArrowLeft, Settings, Zap, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Schema de validation
const fieldConfigSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  type: z.enum(['text', 'number', 'date', 'select', 'checkbox']),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

const commissionTierSchema = z.object({
  min_amount: z.number().min(0),
  max_amount: z.number().optional(),
  rate: z.number().min(0).max(100),
});

const operationTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  affects_balance: z.boolean(),
  status: z.enum(['active', 'inactive', 'archived']),
  fields_config: z.array(fieldConfigSchema),
  commission_rules: z.object({
    type: z.enum(['none', 'fixed', 'percentage', 'tiered']),
    fixed_amount: z.number().optional(),
    percentage: z.number().optional(),
    tiers: z.array(commissionTierSchema).optional(),
  }),
});

type OperationTypeFormData = z.infer<typeof operationTypeSchema>;

const OperationTypeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<OperationTypeFormData>({
    resolver: zodResolver(operationTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      affects_balance: false,
      status: 'active',
      fields_config: [],
      commission_rules: {
        type: 'none',
      },
    },
  });

  const { 
    fields: fieldConfigFields, 
    append: appendField, 
    remove: removeField 
  } = useFieldArray({
    control: form.control,
    name: 'fields_config',
  });

  const { 
    fields: commissionTiers, 
    append: appendTier, 
    remove: removeTier 
  } = useFieldArray({
    control: form.control,
    name: 'commission_rules.tiers',
  });

  const commissionType = form.watch('commission_rules.type');

  // Charger les données si on édite
  useEffect(() => {
    if (isEditing) {
      // TODO: Charger les données du type d'opération
      setIsLoading(true);
      // Simulation de chargement
      setTimeout(() => {
        const mockData = {
          name: 'Virement',
          description: 'Virement bancaire standard',
          affects_balance: true,
          status: 'active' as const,
          fields_config: [
            {
              label: 'Montant',
              type: 'number' as const,
              required: true,
              placeholder: 'Entrez le montant',
            },
            {
              label: 'Bénéficiaire',
              type: 'text' as const,
              required: true,
              placeholder: 'Nom du bénéficiaire',
            },
          ],
          commission_rules: {
            type: 'percentage' as const,
            percentage: 2.5,
          },
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
      // TODO: Implémenter la sauvegarde via API
      console.log('Saving operation type:', data);
      
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/operation-types');
    } catch (error) {
      setSaveError('Erreur lors de la sauvegarde');
      setIsLoading(false);
    }
  };

  const addField = () => {
    appendField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
    });
  };

  const addCommissionTier = () => {
    appendTier({
      min_amount: 0,
      max_amount: undefined,
      rate: 0,
    });
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
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Général</span>
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Champs</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Commissions</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
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
                    id="affects_balance"
                    checked={form.watch('affects_balance')}
                    onCheckedChange={(checked) => form.setValue('affects_balance', checked)}
                  />
                  <Label htmlFor="affects_balance" className="text-sm font-medium">
                    Cette opération affecte le solde de l'agent
                  </Label>
                </div>
                {form.watch('affects_balance') && (
                  <div className="ml-6 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    ⚠️ Les opérations de ce type modifieront automatiquement le solde de l'agent qui les effectue
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Champs */}
          <TabsContent value="fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Configuration des Champs Dynamiques
                  <Badge variant="outline">
                    {fieldConfigFields.length} champs configurés
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldConfigFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">Aucun champ configuré</p>
                    <Button onClick={addField} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le premier champ
                    </Button>
                  </div>
                ) : (
                  <>
                    {fieldConfigFields.map((field, index) => (
                      <Card key={field.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Champ #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Libellé*</Label>
                              <Input
                                {...form.register(`fields_config.${index}.label`)}
                                placeholder="Ex: Montant, Destinataire..."
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Type de Champ</Label>
                              <Select
                                value={form.watch(`fields_config.${index}.type`)}
                                onValueChange={(value) => form.setValue(`fields_config.${index}.type`, value as any)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texte</SelectItem>
                                  <SelectItem value="number">Nombre</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="select">Liste déroulante</SelectItem>
                                  <SelectItem value="checkbox">Case à cocher</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Placeholder</Label>
                              <Input
                                {...form.register(`fields_config.${index}.placeholder`)}
                                placeholder="Texte d'aide..."
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center space-x-2">
                            <Switch
                              checked={form.watch(`fields_config.${index}.required`)}
                              onCheckedChange={(checked) => 
                                form.setValue(`fields_config.${index}.required`, checked)
                              }
                            />
                            <Label className="text-sm">Champ obligatoire</Label>
                          </div>

                          {form.watch(`fields_config.${index}.type`) === 'select' && (
                            <div className="mt-4 space-y-2">
                              <Label>Options (une par ligne)</Label>
                              <Textarea
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                onChange={(e) => {
                                  const options = e.target.value.split('\n').filter(opt => opt.trim());
                                  form.setValue(`fields_config.${index}.options`, options);
                                }}
                                rows={3}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      type="button"
                      onClick={addField}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un champ
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commissions */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Commissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Type de Commission</Label>
                  <RadioGroup
                    value={commissionType}
                    onValueChange={(value) => form.setValue('commission_rules.type', value as any)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">Aucune commission</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Commission fixe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Pourcentage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tiered" id="tiered" />
                      <Label htmlFor="tiered">Paliers (progressif)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {commissionType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Montant Fixe (XOF)</Label>
                    <Input
                      type="number"
                      {...form.register('commission_rules.fixed_amount', { valueAsNumber: true })}
                      placeholder="Ex: 500"
                    />
                  </div>
                )}

                {commissionType === 'percentage' && (
                  <div className="space-y-2">
                    <Label>Pourcentage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register('commission_rules.percentage', { valueAsNumber: true })}
                      placeholder="Ex: 2.5"
                    />
                  </div>
                )}

                {commissionType === 'tiered' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Paliers de Commission</Label>
                      <Button
                        type="button"
                        onClick={addCommissionTier}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un palier
                      </Button>
                    </div>
                    
                    {commissionTiers.map((tier, index) => (
                      <Card key={tier.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Palier #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTier(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Montant Min (XOF)</Label>
                              <Input
                                type="number"
                                {...form.register(`commission_rules.tiers.${index}.min_amount`, { valueAsNumber: true })}
                                placeholder="0"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Montant Max (XOF)</Label>
                              <Input
                                type="number"
                                {...form.register(`commission_rules.tiers.${index}.max_amount`, { valueAsNumber: true })}
                                placeholder="Illimité si vide"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Taux (%)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                {...form.register(`commission_rules.tiers.${index}.rate`, { valueAsNumber: true })}
                                placeholder="Ex: 2.5"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
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