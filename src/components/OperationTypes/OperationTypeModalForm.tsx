
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
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

const OperationTypeModalForm: React.FC<Props> = ({ isOpen, onClose, operationType }) => {
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState({
    name: "",
    description: "",
    impacts_balance: true,
    is_active: true,
    status: "active" as "active" | "inactive" | "archived",
  });

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
  }, [operationType]);

  const handleSave = async () => {
    if (!form.name || !form.description) {
      toast({ 
        title: "Erreur", 
        description: "Nom et description requis", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (operationType) {
        await updateOperationType.mutateAsync({
          id: operationType.id,
          ...form,
        });
        toast({ title: "Succès", description: "Type d'opération modifié." });
      } else {
        await createOperationType.mutateAsync(form);
        toast({ title: "Succès", description: "Type d'opération créé." });
      }
      onClose();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {operationType ? "Modifier le Type d'Opération" : "Nouveau Type d'Opération"}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="fields">Champs</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input 
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ex: Transfert d'argent" 
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description détaillée du service"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="impacts_balance"
                  checked={form.impacts_balance}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, impacts_balance: !!checked }))}
                />
                <Label htmlFor="impacts_balance">Cette opération impacte le solde</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, is_active: !!checked }))}
                />
                <Label htmlFor="is_active">Type d'opération actif</Label>
              </div>
              <div>
                <Label>Statut</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value: "active" | "inactive" | "archived") => 
                    setForm(f => ({ ...f, status: value }))
                  }
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
          </TabsContent>
          
          <TabsContent value="fields">
            <div>
              <p className="text-gray-600">Configuration des champs du formulaire (à implémenter).</p>
            </div>
          </TabsContent>
          
          <TabsContent value="commissions">
            <div>
              <p className="text-gray-600">Configuration des commissions (à implémenter).</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button 
            onClick={handleSave}
            disabled={createOperationType.isPending || updateOperationType.isPending}
          >
            {createOperationType.isPending || updateOperationType.isPending 
              ? "Sauvegarde..." 
              : operationType ? "Modifier" : "Créer"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypeModalForm;
