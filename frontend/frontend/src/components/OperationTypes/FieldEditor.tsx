
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash, GripVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OperationTypeField, useCreateOperationTypeField, useUpdateOperationTypeField, useDeleteOperationTypeField } from "@/hooks/useOperationTypes";

interface FieldEditorProps {
  operationTypeId: string;
  fields: OperationTypeField[];
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'textarea', label: 'Zone de texte' },
  { value: 'file', label: 'Fichier' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'radio', label: 'Bouton radio' },
];

interface FormErrors {
  name?: string;
  label?: string;
  options?: string;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ operationTypeId, fields }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editField, setEditField] = useState<OperationTypeField | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    name: "",
    label: "",
    field_type: "text" as "text" | "number" | "email" | "tel" | "select" | "textarea" | "file" | "date" | "checkbox" | "radio",
    is_required: false,
    placeholder: "",
    help_text: "",
    options: [] as string[],
  });

  const createField = useCreateOperationTypeField();
  const updateField = useUpdateOperationTypeField();
  const deleteField = useDeleteOperationTypeField();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom technique est requis";
    } else if (!/^[a-z_][a-z0-9_]*$/.test(form.name.trim())) {
      newErrors.name = "Le nom doit contenir uniquement des lettres minuscules, chiffres et underscores";
    }

    if (!form.label.trim()) {
      newErrors.label = "Le libellé est requis";
    } else if (form.label.trim().length < 2) {
      newErrors.label = "Le libellé doit contenir au moins 2 caractères";
    }

    if ((form.field_type === 'select' || form.field_type === 'radio') && form.options.length === 0) {
      newErrors.options = "Au moins une option est requise pour ce type de champ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenCreate = () => {
    setEditField(null);
    setForm({
      name: "",
      label: "",
      field_type: "text",
      is_required: false,
      placeholder: "",
      help_text: "",
      options: [],
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (field: OperationTypeField) => {
    setEditField(field);
    setForm({
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      is_required: field.is_required,
      placeholder: field.placeholder || "",
      help_text: field.help_text || "",
      options: Array.isArray(field.options) ? field.options : [],
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleInputChange = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
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

    try {
      const fieldData = {
        name: form.name.trim(),
        label: form.label.trim(),
        field_type: form.field_type,
        is_required: form.is_required,
        placeholder: form.placeholder.trim() || null,
        help_text: form.help_text.trim() || null,
        options: ['select', 'radio'].includes(form.field_type) ? form.options : [],
        operation_type_id: operationTypeId,
        display_order: editField ? editField.display_order : fields.length,
        validation_rules: {},
        is_obsolete: false,
      };

      if (editField) {
        await updateField.mutateAsync({
          id: editField.id,
          updates: {
            operation_type_id: operationTypeId,
            ...fieldData,
          }
        });
        toast({ 
          title: "Succès", 
          description: `Champ "${fieldData.label}" modifié avec succès.` 
        });
      } else {
        await createField.mutateAsync(fieldData);
        toast({ 
          title: "Succès", 
          description: `Champ "${fieldData.label}" créé avec succès.` 
        });
      }
      setModalOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Une erreur est survenue lors de la sauvegarde", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (field: OperationTypeField) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le champ "${field.label}" ?`)) return;
    
    try {
      await deleteField.mutateAsync(field.id);
      toast({ 
        title: "Succès", 
        description: `Champ "${field.label}" supprimé avec succès.` 
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Une erreur est survenue lors de la suppression", 
        variant: "destructive" 
      });
    }
  };

  const handleToggleObsolete = async (field: OperationTypeField) => {
    try {
      await updateField.mutateAsync({
        id: field.id,
        updates: {
          is_obsolete: !field.is_obsolete,
        }
      });
      toast({ 
        title: "Succès", 
        description: `Champ "${field.label}" ${field.is_obsolete ? 'réactivé' : 'marqué comme obsolète'}.` 
      });
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Une erreur est survenue lors de la modification", 
        variant: "destructive" 
      });
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.display_order - b.display_order);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Champs du Formulaire</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configurez les champs que les utilisateurs devront remplir pour ce type d'opération
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Champ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedFields.map((field) => (
            <div 
              key={field.id} 
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                field.is_obsolete ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium ${field.is_obsolete ? 'text-gray-500' : 'text-gray-900'}`}>
                      {field.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                    </Badge>
                    {field.is_required && (
                      <Badge variant="destructive" className="text-xs">Requis</Badge>
                    )}
                    {field.is_obsolete && (
                      <Badge variant="secondary" className="text-xs">Obsolète</Badge>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600 font-mono text-xs">
                      {field.name}
                    </p>
                    {field.placeholder && (
                      <p className="text-gray-500 text-xs">
                        Placeholder: {field.placeholder}
                      </p>
                    )}
                    {field.help_text && (
                      <p className="text-gray-500 text-xs">
                        Aide: {field.help_text}
                      </p>
                    )}
                    {field.options && field.options.length > 0 && (
                      <p className="text-gray-500 text-xs">
                        Options: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleOpenEdit(field)}
                  title="Modifier ce champ"
                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleToggleObsolete(field)}
                  title={field.is_obsolete ? "Réactiver ce champ" : "Marquer comme obsolète"}
                  className={`h-8 w-8 p-0 ${
                    field.is_obsolete 
                      ? 'hover:bg-green-100 hover:text-green-700' 
                      : 'hover:bg-orange-100 hover:text-orange-700'
                  }`}
                >
                  {field.is_obsolete ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(field)}
                  title="Supprimer ce champ"
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Aucun champ configuré</p>
                  <p className="text-gray-400 text-sm">Cliquez sur "Nouveau Champ" pour commencer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editField ? `Modifier "${editField.label}"` : "Nouveau Champ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Nom technique *</Label>
                <Input 
                  id="field-name"
                  value={form.name} 
                  onChange={e => handleInputChange('name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="ex: numero_telephone"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500">
                  Utilisé en interne. Lettres minuscules, chiffres et underscores uniquement.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-label">Libellé *</Label>
                <Input 
                  id="field-label"
                  value={form.label} 
                  onChange={e => handleInputChange('label', e.target.value)}
                  placeholder="ex: Numéro de téléphone"
                  className={errors.label ? "border-red-500" : ""}
                />
                {errors.label && (
                  <p className="text-sm text-red-600">{errors.label}</p>
                )}
                <p className="text-xs text-gray-500">
                  Affiché à l'utilisateur dans le formulaire.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de champ *</Label>
                <Select 
                  value={form.field_type} 
                  onValueChange={(value: "text" | "number" | "email" | "tel" | "select" | "textarea" | "file" | "date" | "checkbox" | "radio") => 
                    handleInputChange('field_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="required"
                  checked={form.is_required}
                  onCheckedChange={(checked) => handleInputChange('is_required', !!checked)}
                />
                <Label htmlFor="required">Champ requis</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input 
                id="placeholder"
                value={form.placeholder} 
                onChange={e => handleInputChange('placeholder', e.target.value)}
                placeholder="Texte d'exemple affiché dans le champ"
              />
              <p className="text-xs text-gray-500">
                Texte d'aide affiché dans le champ vide.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="help-text">Texte d'aide</Label>
              <Textarea 
                id="help-text"
                value={form.help_text} 
                onChange={e => handleInputChange('help_text', e.target.value)}
                placeholder="Instructions ou informations supplémentaires pour l'utilisateur"
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                Affiché sous le champ pour guider l'utilisateur.
              </p>
            </div>

            {(form.field_type === 'select' || form.field_type === 'radio') && (
              <div className="space-y-2">
                <Label>Options * (une par ligne)</Label>
                <Textarea 
                  value={form.options.join('\n')}
                  onChange={e => handleInputChange('options', e.target.value.split('\n').filter(o => o.trim()))}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className={`min-h-[120px] ${errors.options ? "border-red-500" : ""}`}
                />
                {errors.options && (
                  <p className="text-sm text-red-600">{errors.options}</p>
                )}
                <p className="text-xs text-gray-500">
                  Saisissez chaque option sur une ligne séparée.
                </p>
                {form.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.options.map((option, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!form.name.trim() || !form.label.trim()}
              >
                {editField ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FieldEditor;
