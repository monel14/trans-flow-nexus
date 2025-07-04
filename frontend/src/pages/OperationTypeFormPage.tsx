import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Plus, Trash2, Settings, FileText, Calculator } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { 
  useCreateOperationType, 
  useUpdateOperationType,
  useOperationTypeWithFields,
  useCreateOperationTypeField,
  useUpdateOperationTypeField,
  useDeleteOperationTypeField,
  useCreateCommissionRule,
  useUpdateCommissionRule,
  useCommissionRules,
  OperationType,
  OperationTypeField,
  CommissionRule
} from '@/hooks/useOperationTypes';

// Schémas de validation
const fieldSchema = z.object({
  name: z.string().min(1, 'Nom technique requis').regex(/^[a-zA-Z0-9_]+$/, 'Seuls lettres, chiffres et _ autorisés'),
  label: z.string().min(1, 'Libellé requis'),
  field_type: z.enum(['text', 'number', 'email', 'tel', 'select', 'textarea', 'file', 'date', 'checkbox', 'radio']),
  is_required: z.boolean(),
  is_obsolete: z.boolean(),
  display_order: z.number(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation_rules: z.any().optional(),
});

const tierSchema = z.object({
  min_amount: z.number().min(0, 'Montant minimum requis'),
  max_amount: z.number().min(0, 'Montant maximum requis'),
  commission_value: z.number().min(0, 'Commission requise'),
  commission_type: z.enum(['fixed', 'percentage']),
});

const commissionSchema = z.object({
  commission_type: z.enum(['none', 'fixed', 'percentage', 'tiered']),
  fixed_amount: z.number().optional(),
  percentage_rate: z.number().optional(),
  tiers: z.array(tierSchema).optional(),
});

const operationTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  impacts_balance: z.boolean(),
  status: z.enum(['active', 'inactive', 'archived']),
  fields: z.array(fieldSchema).optional(),
  commission: commissionSchema.optional(),
});

type OperationTypeFormData = z.infer<typeof operationTypeSchema>;

const OperationTypeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Hooks pour les données
  const { data: operationTypeData, isLoading: isLoadingData } = useOperationTypeWithFields(id || '');
  const { data: commissionRules } = useCommissionRules(id);
  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();
  const createField = useCreateOperationTypeField();
  const updateField = useUpdateOperationTypeField();
  const deleteField = useDeleteOperationTypeField();
  const createCommissionRule = useCreateCommissionRule();
  const updateCommissionRule = useUpdateCommissionRule();

  const form = useForm<OperationTypeFormData>({
    resolver: zodResolver(operationTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      impacts_balance: false,
      status: 'active',
      fields: [],
      commission: {
        commission_type: 'none',
        tiers: [],
      },
    },
  });

  const { fields, append: appendField, remove: removeField, update: updateFieldArray } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const { fields: tiers, append: appendTier, remove: removeTier } = useFieldArray({
    control: form.control,
    name: 'commission.tiers',
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (isEditing && operationTypeData) {
      const fieldsData = operationTypeData.operation_type_fields?.map((field: any) => ({
        ...field,
        options: field.options || [],
      })) || [];
      
      const commissionData = commissionRules?.[0] || {};
      let commissionType = 'none';
      let commissionValues: any = {};

      if (commissionData.commission_type === 'fixed') {
        commissionType = 'fixed';
        commissionValues.fixed_amount = commissionData.fixed_amount;
      } else if (commissionData.commission_type === 'percentage') {
        commissionType = 'percentage';
        commissionValues.percentage_rate = commissionData.percentage_rate;
      } else if (commissionData.commission_type === 'tiered') {
        commissionType = 'tiered';
        commissionValues.tiers = commissionData.tiered_rules || [];
      }

      form.reset({
        name: operationTypeData.name,
        description: operationTypeData.description || '',
        impacts_balance: operationTypeData.impacts_balance,
        status: operationTypeData.status as any,
        fields: fieldsData,
        commission: {
          commission_type: commissionType as any,
          ...commissionValues,
        },
      });
    }
  }, [isEditing, operationTypeData, commissionRules, form]);

  const onSubmit = async (data: OperationTypeFormData) => {
    setIsLoading(true);
    
    try {
      let operationTypeId = id;

      // 1. Créer ou mettre à jour le type d'opération
      if (isEditing && id) {
        await updateOperationType.mutateAsync({
          id,
          updates: {
            name: data.name,
            description: data.description,
            impacts_balance: data.impacts_balance,
            status: data.status,
            is_active: data.status === 'active',
          }
        });
      } else {
        const newOperationType = await createOperationType.mutateAsync({
          name: data.name,
          description: data.description || '',
          impacts_balance: data.impacts_balance,
          status: data.status,
          is_active: data.status === 'active',
        } as any);
        operationTypeId = newOperationType.id;
      }

      // 2. Gérer les champs si on a un ID
      if (operationTypeId && data.fields) {
        // Supprimer les anciens champs en mode édition
        if (isEditing && operationTypeData?.operation_type_fields) {
          for (const oldField of operationTypeData.operation_type_fields) {
            const stillExists = data.fields.find(f => f.name === oldField.name);
            if (!stillExists) {
              await deleteField.mutateAsync(oldField.id);
            }
          }
        }

        // Créer ou mettre à jour les champs
        for (let i = 0; i < data.fields.length; i++) {
          const field = data.fields[i];
          const existingField = operationTypeData?.operation_type_fields?.find(f => f.name === field.name);
          
          if (existingField) {
            await updateField.mutateAsync({
              id: existingField.id,
              updates: {
                ...field,
                operation_type_id: operationTypeId,
                display_order: i,
              }
            });
          } else {
            await createField.mutateAsync({
              ...field,
              operation_type_id: operationTypeId,
              display_order: i,
            } as any);
          }
        }
      }

      // 3. Gérer les règles de commission
      if (operationTypeId && data.commission) {
        const existingRule = commissionRules?.[0];
        
        if (data.commission.commission_type === 'none') {
          // Supprimer la règle existante si elle existe
          if (existingRule) {
            await updateCommissionRule.mutateAsync({
              id: existingRule.id,
              updates: { is_active: false }
            });
          }
        } else {
          const ruleData: any = {
            operation_type_id: operationTypeId,
            commission_type: data.commission.commission_type,
            is_active: true,
          };

          if (data.commission.commission_type === 'fixed') {
            ruleData.fixed_amount = data.commission.fixed_amount;
          } else if (data.commission.commission_type === 'percentage') {
            ruleData.percentage_rate = data.commission.percentage_rate;
          } else if (data.commission.commission_type === 'tiered') {
            ruleData.tiered_rules = data.commission.tiers;
          }

          if (existingRule) {
            await updateCommissionRule.mutateAsync({
              id: existingRule.id,
              updates: ruleData
            });
          } else {
            await createCommissionRule.mutateAsync(ruleData);
          }
        }
      }

      toast.success(isEditing ? 'Type d\'opération mis à jour avec succès !' : 'Type d\'opération créé avec succès !');
      navigate('/operation-types');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    appendField({
      name: '',
      label: '',
      field_type: 'text',
      is_required: false,
      is_obsolete: false,
      display_order: fields.length,
      placeholder: '',
      help_text: '',
      options: [],
    });
  };

  const addTier = () => {
    appendTier({
      min_amount: 0,
      max_amount: 0,
      commission_value: 0,
      commission_type: 'percentage',
    });
  };

  const commissionType = form.watch('commission.commission_type');
  const impactsBalance = form.watch('impacts_balance');

  if (isLoadingData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

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
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Informations Générales</span>
                </TabsTrigger>
                <TabsTrigger value="fields" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Champs du Formulaire</span>
                </TabsTrigger>
                <TabsTrigger value="commission" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Configuration Commissions</span>
                </TabsTrigger>
              </TabsList>

              {/* Onglet 1: Informations Générales */}
              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du Type d'Opération*</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Ex: Paiement Facture CIE, Transfert RIA..."
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Ce nom apparaîtra dans les listes pour les agents. Il doit être unique.
                    </p>
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
                        <SelectItem value="active">
                          Actif - Disponible pour les agences
                        </SelectItem>
                        <SelectItem value="inactive">
                          Inactif - Temporairement désactivé
                        </SelectItem>
                        <SelectItem value="archived">
                          Archivé - Plus utilisable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Ex: Utiliser pour tous les paiements de factures de la Compagnie Ivoirienne d'Électricité"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Description optionnelle pour expliquer l'utilité de cette opération.
                  </p>
                </div>

                <div className="space-y-4">
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
                  {impactsBalance && (
                    <div className="ml-6 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="font-medium">⚠️ Impact sur les soldes activé</p>
                      <p>Toute transaction de ce type débitera le solde de l'initiateur après validation.</p>
                    </div>
                  )}
                  {!impactsBalance && (
                    <div className="ml-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="font-medium">ℹ️ Opération informative</p>
                      <p>Cette opération est purement informative ou de suivi, sans impact financier.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Onglet 2: Configuration des Champs */}
              <TabsContent value="fields" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Champs du Formulaire</h3>
                    <p className="text-sm text-gray-600">
                      Configurez les champs que l'agent devra remplir pour effectuer cette opération.
                    </p>
                  </div>
                  <Button type="button" onClick={addField} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Champ
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Aucun champ configuré</p>
                    <p className="text-sm">Cliquez sur "Ajouter un Champ" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Champ {index + 1}</Badge>
                            {form.watch(`fields.${index}.is_required`) && (
                              <Badge variant="destructive">Requis</Badge>
                            )}
                            {form.watch(`fields.${index}.is_obsolete`) && (
                              <Badge variant="secondary">Obsolète</Badge>
                            )}
                          </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Libellé*</Label>
                            <Input
                              {...form.register(`fields.${index}.label`)}
                              placeholder="Ex: Numéro de compteur"
                            />
                            <p className="text-xs text-gray-500">
                              Texte affiché à côté du champ pour l'agent
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Nom Technique*</Label>
                            <Input
                              {...form.register(`fields.${index}.name`)}
                              placeholder="Ex: numero_compteur"
                            />
                            <p className="text-xs text-gray-500">
                              Identifiant unique (lettres, chiffres, _)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Type de Champ</Label>
                            <Select
                              value={form.watch(`fields.${index}.field_type`)}
                              onValueChange={(value) => form.setValue(`fields.${index}.field_type`, value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texte</SelectItem>
                                <SelectItem value="number">Nombre</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Téléphone</SelectItem>
                                <SelectItem value="textarea">Zone de texte multiligne</SelectItem>
                                <SelectItem value="file">Upload de fichier</SelectItem>
                                <SelectItem value="select">Liste déroulante</SelectItem>
                                <SelectItem value="checkbox">Case à cocher</SelectItem>
                                <SelectItem value="radio">Boutons radio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                              {...form.register(`fields.${index}.placeholder`)}
                              placeholder="Texte d'aide dans le champ"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Texte d'aide</Label>
                            <Textarea
                              {...form.register(`fields.${index}.help_text`)}
                              placeholder="Instructions supplémentaires pour l'agent"
                              rows={2}
                            />
                          </div>

                          <div className="flex items-center space-x-6 md:col-span-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={form.watch(`fields.${index}.is_required`)}
                                onCheckedChange={(checked) => form.setValue(`fields.${index}.is_required`, checked)}
                              />
                              <Label>Requis</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={form.watch(`fields.${index}.is_obsolete`)}
                                onCheckedChange={(checked) => form.setValue(`fields.${index}.is_obsolete`, checked)}
                              />
                              <Label>Obsolète</Label>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Onglet 3: Configuration des Commissions */}
              <TabsContent value="commission" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold">Configuration des Commissions</h3>
                  <p className="text-sm text-gray-600">
                    Définissez comment les commissions sont calculées pour ce type d'opération.
                  </p>
                </div>

                {!impactsBalance && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium">⚠️ Attention</p>
                    <p className="text-yellow-700 text-sm">
                      Les commissions ne sont applicables que si l'opération impacte les soldes.
                      Activez "Impacte les Soldes" dans l'onglet "Informations Générales" pour configurer les commissions.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Type de Règle de Commission</Label>
                  <RadioGroup
                    value={commissionType}
                    onValueChange={(value) => form.setValue('commission.commission_type', value as any)}
                    disabled={!impactsBalance}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">Aucune commission</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Montant fixe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Pourcentage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tiered" id="tiered" />
                      <Label htmlFor="tiered">Paliers (tranches)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {commissionType === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Montant fixe (en XOF)</Label>
                    <Input
                      type="number"
                      {...form.register('commission.fixed_amount', { valueAsNumber: true })}
                      placeholder="Ex: 50"
                    />
                    <p className="text-xs text-gray-500">
                      Commission fixe prélevée sur chaque transaction
                    </p>
                  </div>
                )}

                {commissionType === 'percentage' && (
                  <div className="space-y-2">
                    <Label>Pourcentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register('commission.percentage_rate', { valueAsNumber: true })}
                      placeholder="Ex: 1.5"
                    />
                    <p className="text-xs text-gray-500">
                      Pourcentage du montant de la transaction
                    </p>
                  </div>
                )}

                {commissionType === 'tiered' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Paliers de Commission</Label>
                      <Button type="button" onClick={addTier} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un Palier
                      </Button>
                    </div>

                    {tiers.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p>Aucun palier configuré</p>
                        <p className="text-sm">Cliquez sur "Ajouter un Palier" pour commencer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tiers.map((tier, index) => (
                          <Card key={tier.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">Palier {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTier(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label>De (XOF)</Label>
                                <Input
                                  type="number"
                                  {...form.register(`commission.tiers.${index}.min_amount`, { valueAsNumber: true })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>À (XOF)</Label>
                                <Input
                                  type="number"
                                  {...form.register(`commission.tiers.${index}.max_amount`, { valueAsNumber: true })}
                                  placeholder="1000"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Commission</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...form.register(`commission.tiers.${index}.commission_value`, { valueAsNumber: true })}
                                  placeholder="50"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Type</Label>
                                <Select
                                  value={form.watch(`commission.tiers.${index}.commission_type`)}
                                  onValueChange={(value) => form.setValue(`commission.tiers.${index}.commission_type`, value as any)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fixed">Fixe (XOF)</SelectItem>
                                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
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