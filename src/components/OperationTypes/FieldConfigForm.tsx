
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus } from "lucide-react";
import { OperationTypeField } from "@/hooks/useOperationTypes";

interface FieldConfigFormProps {
  field?: OperationTypeField | null;
  onSave: (fieldData: Partial<OperationTypeField>) => void;
  onCancel: () => void;
  operationTypeId: string;
}

const FieldConfigForm: React.FC<FieldConfigFormProps> = ({
  field,
  onSave,
  onCancel,
  operationTypeId
}) => {
  const [formData, setFormData] = useState({
    name: field?.name || "",
    label: field?.label || "",
    field_type: field?.field_type || "text",
    is_required: field?.is_required || false,
    is_obsolete: field?.is_obsolete || false,
    display_order: field?.display_order || 0,
    placeholder: field?.placeholder || "",
    help_text: field?.help_text || "",
    validation_rules: field?.validation_rules || {},
    options: field?.options || []
  });

  const [options, setOptions] = useState<Array<{value: string, label: string}>>(
    field?.options || []
  );

  const fieldTypes = [
    { value: "text", label: "Texte Court" },
    { value: "textarea", label: "Texte Long" },
    { value: "number", label: "Nombre" },
    { value: "email", label: "Email" },
    { value: "tel", label: "Téléphone" },
    { value: "date", label: "Date" },
    { value: "select", label: "Liste Déroulante" },
    { value: "checkbox", label: "Case à Cocher" },
    { value: "radio", label: "Boutons Radio" },
    { value: "file", label: "Upload Fichier" }
  ];

  const needsOptions = ["select", "radio"].includes(formData.field_type);

  const addOption = () => {
    setOptions([...options, { value: "", label: "" }]);
  };

  const updateOption = (index: number, field: "value" | "label", value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldData = {
      ...formData,
      operation_type_id: operationTypeId,
      options: needsOptions ? options : []
    };

    onSave(fieldData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {field ? "Modifier le Champ" : "Nouveau Champ"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">Libellé Affiché *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                placeholder="Ex: Numéro du Bénéficiaire"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom Technique *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: beneficiary_phone"
                pattern="[a-z_]+"
                title="Utilisez uniquement des lettres minuscules et des underscores"
                required
              />
              <p className="text-xs text-gray-500">
                Utilisez uniquement des lettres minuscules et des underscores
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_type">Type de Champ *</Label>
            <Select 
              value={formData.field_type} 
              onValueChange={(value) => setFormData({...formData, field_type: value as any})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                placeholder="Ex: 771234567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordre d'Affichage</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="help_text">Texte d'Aide</Label>
            <Textarea
              id="help_text"
              value={formData.help_text}
              onChange={(e) => setFormData({...formData, help_text: e.target.value})}
              placeholder="Message d'aide pour l'utilisateur"
              rows={2}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({...formData, is_required: !!checked})}
              />
              <Label htmlFor="is_required">Champ obligatoire</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_obsolete"
                checked={formData.is_obsolete}
                onCheckedChange={(checked) => setFormData({...formData, is_obsolete: !!checked})}
              />
              <Label htmlFor="is_obsolete">Champ obsolète</Label>
            </div>
          </div>

          {needsOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options pour {formData.field_type === "select" ? "la liste" : "les boutons radio"}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Valeur"
                      value={option.value}
                      onChange={(e) => updateOption(index, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Libellé affiché"
                      value={option.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {options.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Aucune option définie. Cliquez sur "Ajouter Option" pour commencer.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {field ? "Mettre à Jour" : "Créer le Champ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FieldConfigForm;
