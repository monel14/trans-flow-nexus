
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
import { Plus, Edit, Trash, GripVertical } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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

const FieldEditor: React.FC<FieldEditorProps> = ({ operationTypeId, fields }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editField, setEditField] = useState<OperationTypeField | null>(null);
  const [form, setForm] = useState({
    name: "",
    label: "",
    field_type: "text" as const,
    is_required: false,
    placeholder: "",
    help_text: "",
    options: [] as string[],
  });

  const createField = useCreateOperationTypeField();
  const updateField = useUpdateOperationTypeField();
  const deleteField = useDeleteOperationTypeField();

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
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.label) {
      toast({ title: "Erreur", description: "Nom et libellé requis", variant: "destructive" });
      return;
    }

    try {
      const fieldData = {
        ...form,
        operation_type_id: operationTypeId,
        display_order: editField ? editField.display_order : fields.length,
        validation_rules: {},
        is_obsolete: false,
      };

      if (editField) {
        await updateField.mutateAsync({
          id: editField.id,
          operation_type_id: operationTypeId,
          ...fieldData,
        });
        toast({ title: "Succès", description: "Champ modifié." });
      } else {
        await createField.mutateAsync(fieldData);
        toast({ title: "Succès", description: "Champ créé." });
      }
      setModalOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (field: OperationTypeField) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce champ ?")) return;
    
    try {
      await deleteField.mutateAsync({ id: field.id, operation_type_id: operationTypeId });
      toast({ title: "Succès", description: "Champ supprimé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleMarkObsolete = async (field: OperationTypeField) => {
    try {
      await updateField.mutateAsync({
        id: field.id,
        operation_type_id: operationTypeId,
        is_obsolete: !field.is_obsolete,
      });
      toast({ 
        title: "Succès", 
        description: `Champ ${field.is_obsolete ? 'réactivé' : 'marqué comme obsolète'}.` 
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Champs du Formulaire</CardTitle>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Champ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{field.label}</span>
                    <Badge variant="outline">{FIELD_TYPES.find(t => t.value === field.field_type)?.label}</Badge>
                    {field.is_required && <Badge variant="destructive">Requis</Badge>}
                    {field.is_obsolete && <Badge variant="secondary">Obsolète</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{field.name}</p>
                  {field.help_text && <p className="text-xs text-gray-500">{field.help_text}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(field)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleMarkObsolete(field)}
                  title={field.is_obsolete ? "Réactiver" : "Marquer obsolète"}
                >
                  {field.is_obsolete ? "✓" : "⊘"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(field)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              Aucun champ défini. Cliquez sur "Nouveau Champ" pour commencer.
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editField ? "Modifier le Champ" : "Nouveau Champ"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom technique *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: numero_telephone"
              />
            </div>
            <div>
              <Label>Libellé *</Label>
              <Input 
                value={form.label} 
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="ex: Numéro de téléphone"
              />
            </div>
            <div>
              <Label>Type de champ</Label>
              <Select value={form.field_type} onValueChange={(value: any) => setForm(f => ({ ...f, field_type: value }))}>
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
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_required: !!checked }))}
              />
              <Label htmlFor="required">Champ requis</Label>
            </div>
            <div className="col-span-2">
              <Label>Placeholder</Label>
              <Input 
                value={form.placeholder} 
                onChange={e => setForm(f => ({ ...f, placeholder: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Texte d'aide</Label>
              <Textarea 
                value={form.help_text} 
                onChange={e => setForm(f => ({ ...f, help_text: e.target.value }))}
              />
            </div>
            {(form.field_type === 'select' || form.field_type === 'radio') && (
              <div className="col-span-2">
                <Label>Options (une par ligne)</Label>
                <Textarea 
                  value={form.options.join('\n')} 
                  onChange={e => setForm(f => ({ ...f, options: e.target.value.split('\n').filter(o => o.trim()) }))}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}
            <div className="col-span-2 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
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
