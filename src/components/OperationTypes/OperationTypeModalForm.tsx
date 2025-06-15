
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  OperationType, 
  useCreateOperationType, 
  useUpdateOperationType 
} from "@/hooks/useOperationTypes";

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

  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();

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
          ...formData,
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

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {operationType ? `Modifier "${operationType.name}"` : "Nouveau Type d'Opération"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="fields" disabled={!operationType}>
              Champs
              {!operationType && <span className="ml-1 text-xs opacity-60">(après création)</span>}
            </TabsTrigger>
            <TabsTrigger value="commissions" disabled={!operationType}>
              Commissions
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Configuration des champs du formulaire</h3>
              <p className="text-gray-600 text-sm">
                Cette fonctionnalité sera disponible après la création du type d'opération. 
                Vous pourrez configurer les champs personnalisés que les utilisateurs devront remplir.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="commissions" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Configuration des commissions</h3>
              <p className="text-gray-600 text-sm">
                Cette fonctionnalité sera disponible après la création du type d'opération. 
                Vous pourrez configurer les règles de commission (fixe, pourcentage, paliers).
              </p>
            </div>
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
  );
};

export default OperationTypeModalForm;
