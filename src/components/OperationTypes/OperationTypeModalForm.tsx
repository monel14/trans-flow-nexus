import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, ArrowUp, ArrowDown, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  OperationType, 
  OperationTypeField,
  CommissionRule,
  useCreateOperationType, 
  useUpdateOperationType,
  useOperationTypeFields,
  useCommissionRules,
  useCreateOperationTypeField,
  useUpdateOperationTypeField,
  useDeleteOperationTypeField,
  useCreateCommissionRule,
  useUpdateCommissionRule
} from "@/hooks/useOperationTypes";
import FieldConfigForm from "./FieldConfigForm";
import CommissionConfigForm from "./CommissionConfigForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  operationType?: OperationType | null;
};

interface FormErrors {
  name?: string;
  description?: string;
}

const OperationTypeModalForm: React.FC<Props> = ({ isOpen, onClose, operationType }) => {
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState({
    name: "",
    description: "",
    impacts_balance: true,
    is_active: true,
    status: "active" as "active" | "inactive" | "archived",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les modales de configuration
  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);
  const [commissionConfigOpen, setCommissionConfigOpen] = useState(false);
  const [editingField, setEditingField] = useState<OperationTypeField | null>(null);
  const [editingCommission, setEditingCommission] = useState<CommissionRule | null>(null);

  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();
  const { data: fields = [] } = useOperationTypeFields(operationType?.id);
  const { data: commissionRules = [] } = useCommissionRules(operationType?.id);
  
  const createField = useCreateOperationTypeField();
  const updateField = useUpdateOperationTypeField();
  const deleteField = useDeleteOperationTypeField();
  const createCommission = useCreateCommissionRule();
  const updateCommission = useUpdateCommissionRule();

  useEffect(() => {
    if (operationType) {
      setForm({
        name: operationType.name,
        description: operationType.description,
        impacts_balance: operationType.impacts_balance,
        is_active: operationType.is_active,
        status: operationType.status,
      });
    } else {
      setForm({
        name: "",
        description: "",
        impacts_balance: true,
        is_active: true,
        status: "active",
      });
    }
    setErrors({});
    setTab("general");
  }, [operationType, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
    }

    if (!form.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "La description doit contenir au moins 10 caractères";
    } else if (form.description.trim().length > 500) {
      newErrors.description = "La description ne peut pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ 
        title: "Erreur de validation", 
        description: "Veuillez corriger les erreurs dans le formulaire", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        name: form.name.trim(),
        description: form.description.trim(),
        impacts_balance: form.impacts_balance,
        is_active: form.is_active,
        status: form.status,
      };

      if (operationType) {
        await updateOperationType.mutateAsync({
          id: operationType.id,
          updates: formData,
        });
        toast({ 
          title: "Succès", 
          description: `Type d'opération "${formData.name}" modifié avec succès.` 
        });
      } else {
        await createOperationType.mutateAsync(formData);
        toast({ 
          title: "Succès", 
          description: `Type d'opération "${formData.name}" créé avec succès.` 
        });
      }
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Une erreur est survenue lors de la sauvegarde", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldSave = async (fieldData: Partial<OperationTypeField>) => {
    try {
      if (editingField) {
        await updateField.mutateAsync({
          id: editingField.id,
          updates: fieldData,
        });
        toast({ title: "Succès", description: "Champ modifié avec succès." });
      } else {
        await createField.mutateAsync({
          operation_type_id: operationType!.id,
          ...fieldData,
        } as Omit<OperationTypeField, 'id' | 'created_at' | 'updated_at'>);
        toast({ title: "Succès", description: "Champ créé avec succès." });
      }
      setFieldConfigOpen(false);
      setEditingField(null);
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la sauvegarde du champ", 
        variant: "destructive" 
      });
    }
  };

  const handleCommissionSave = async (commissionData: Partial<CommissionRule>) => {
    try {
      if (editingCommission) {
        await updateCommission.mutateAsync({
          id: editingCommission.id,
          operation_type_id: operationType!.id,
          ...commissionData,
        });
        toast({ title: "Succès", description: "Règle de commission modifiée avec succès." });
      } else {
        await createCommission.mutateAsync({
          operation_type_id: operationType!.id,
          ...commissionData,
        } as Omit<CommissionRule, 'id' | 'created_at' | 'updated_at'>);
        toast({ title: "Succès", description: "Règle de commission créée avec succès." });
      }
      setCommissionConfigOpen(false);
      setEditingCommission(null);
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la sauvegarde de la commission", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteField = async (field: OperationTypeField) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le champ "${field.label}" ?`)) {
      try {
        await deleteField.mutateAsync({
          id: field.id,
          operation_type_id: field.operation_type_id
        });
        toast({ title: "Succès", description: "Champ supprimé avec succès." });
      } catch (error: any) {
        toast({ 
          title: "Erreur", 
          description: error.message || "Erreur lors de la suppression du champ", 
          variant: "destructive" 
        });
      }
    }
  };

  const getFieldTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      text: { label: "Texte", color: "bg-blue-100 text-blue-800" },
      textarea: { label: "Texte Long", color: "bg-blue-100 text-blue-800" },
      number: { label: "Nombre", color: "bg-green-100 text-green-800" },
      email: { label: "Email", color: "bg-purple-100 text-purple-800" },
      tel: { label: "Téléphone", color: "bg-orange-100 text-orange-800" },
      date: { label: "Date", color: "bg-yellow-100 text-yellow-800" },
      select: { label: "Liste", color: "bg-indigo-100 text-indigo-800" },
      checkbox: { label: "Case", color: "bg-pink-100 text-pink-800" },
      radio: { label: "Radio", color: "bg-gray-100 text-gray-800" },
      file: { label: "Fichier", color: "bg-red-100 text-red-800" }
    };
    
    const typeInfo = types[type] || { label: type, color: "bg-gray-100 text-gray-800" };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const formatCommissionDisplay = (rule: CommissionRule) => {
    if (rule.commission_type === 'fixed') {
      return `${rule.fixed_amount} FCFA`;
    } else if (rule.commission_type === 'percentage') {
      return `${(rule.percentage_rate! * 100).toFixed(2)}%`;
    } else if (rule.commission_type === 'tiered') {
      const tieredRulesArray = rule.tiered_rules as any[];
      return `${tieredRulesArray?.length || 0} palier(s)`;
    }
    return 'Non défini';
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    setFieldConfigOpen(false);
    setCommissionConfigOpen(false);
    setEditingField(null);
    setEditingCommission(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {operationType ? `Modifier "${operationType.name}"` : "Nouveau Type d'Opération"}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="general">Informations Générales</TabsTrigger>
              <TabsTrigger value="fields" disabled={!operationType}>
                Champs du Formulaire
                {!operationType && <span className="ml-1 text-xs opacity-60">(après création)</span>}
              </TabsTrigger>
              <TabsTrigger value="commissions" disabled={!operationType}>
                Règles de Commission
                {!operationType && <span className="ml-1 text-xs opacity-60">(après création)</span>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="required">
                    Nom du type d'opération *
                  </Label>
                  <Input 
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ex: Transfert d'argent, Dépôt, Retrait..."
                    className={errors.name ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description *
                  </Label>
                  <Textarea 
                    id="description"
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description détaillée du type d'opération et de son utilisation..."
                    className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {form.description.length}/500 caractères
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="impacts_balance"
                          checked={form.impacts_balance}
                          onCheckedChange={(checked) => handleInputChange('impacts_balance', !!checked)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="impacts_balance" className="text-sm font-normal">
                          Cette opération impacte le solde
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="is_active"
                          checked={form.is_active}
                          onCheckedChange={(checked) => handleInputChange('is_active', !!checked)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="is_active" className="text-sm font-normal">
                          Type d'opération actif
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select 
                      value={form.status} 
                      onValueChange={(value: "active" | "inactive" | "archived") => 
                        handleInputChange('status', value)
                      }
                      disabled={isSubmitting}
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
              </div>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4">
              {operationType ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Champs du Formulaire</CardTitle>
                      <Button onClick={() => {
                        setEditingField(null);
                        setFieldConfigOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Champ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {fields.length === 0 ? (
                      <div className="text-center py-8">
                        <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun champ configuré</h3>
                        <p className="text-gray-600 mb-4">
                          Ajoutez des champs pour créer le formulaire que les agents utiliseront.
                        </p>
                        <Button onClick={() => {
                          setEditingField(null);
                          setFieldConfigOpen(true);
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Créer le Premier Champ
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Libellé</TableHead>
                            <TableHead>Nom Technique</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Requis</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((field) => (
                            <TableRow key={field.id} className={field.is_obsolete ? "opacity-60" : ""}>
                              <TableCell className="font-medium">
                                {field.label}
                                {field.is_obsolete && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Obsolète
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-gray-600">
                                {field.name}
                              </TableCell>
                              <TableCell>
                                {getFieldTypeBadge(field.field_type)}
                              </TableCell>
                              <TableCell>
                                {field.is_required ? (
                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                    Oui
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Non</Badge>
                                )}
                              </TableCell>
                              <TableCell>{field.display_order}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingField(field);
                                      setFieldConfigOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteField(field)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Configuration des champs du formulaire</h3>
                  <p className="text-gray-600 text-sm">
                    Cette fonctionnalité sera disponible après la création du type d'opération. 
                    Vous pourrez configurer les champs personnalisés que les utilisateurs devront remplir.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="commissions" className="space-y-4">
              {operationType ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Règles de Commission</CardTitle>
                      <Button onClick={() => {
                        setEditingCommission(null);
                        setCommissionConfigOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Règle
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {commissionRules.length === 0 ? (
                      <div className="text-center py-8">
                        <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune règle de commission</h3>
                        <p className="text-gray-600 mb-4">
                          Définissez comment les commissions seront calculées pour ce type d'opération.
                        </p>
                        <Button onClick={() => {
                          setEditingCommission(null);
                          setCommissionConfigOpen(true);
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Créer la Première Règle
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {commissionRules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                {rule.commission_type === 'fixed' && 'Commission Fixe'}
                                {rule.commission_type === 'percentage' && 'Commission Pourcentage'}
                                {rule.commission_type === 'tiered' && 'Commission par Paliers'}
                                {!rule.is_active && (
                                  <Badge variant="secondary" className="ml-2">Inactive</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatCommissionDisplay(rule)}
                              </div>
                              {(rule.min_amount > 0 || rule.max_amount) && (
                                <div className="text-xs text-gray-500">
                                  Montant: {rule.min_amount} FCFA - {rule.max_amount || '∞'} FCFA
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCommission(rule);
                                  setCommissionConfigOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Configuration des commissions</h3>
                  <p className="text-gray-600 text-sm">
                    Cette fonctionnalité sera disponible après la création du type d'opération. 
                    Vous pourrez configurer les règles de commission (fixe, pourcentage, paliers).
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              * Champs obligatoires
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSubmitting || !form.name.trim() || !form.description.trim()}
              >
                {isSubmitting 
                  ? "Sauvegarde..." 
                  : operationType ? "Modifier" : "Créer"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuration des champs */}
      <Dialog open={fieldConfigOpen} onOpenChange={setFieldConfigOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <FieldConfigForm
            field={editingField}
            onSave={handleFieldSave}
            onCancel={() => {
              setFieldConfigOpen(false);
              setEditingField(null);
            }}
            operationTypeId={operationType?.id || ""}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de configuration des commissions */}
      <Dialog open={commissionConfigOpen} onOpenChange={setCommissionConfigOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CommissionConfigForm
            rule={editingCommission}
            onSave={handleCommissionSave}
            onCancel={() => {
              setCommissionConfigOpen(false);
              setEditingCommission(null);
            }}
            operationTypeId={operationType?.id || ""}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OperationTypeModalForm;
