
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CommissionRule, useCreateCommissionRule, useUpdateCommissionRule } from "@/hooks/useOperationTypes";

interface CommissionEditorProps {
  operationTypeId: string;
  rules: CommissionRule[];
}

interface TieredRule {
  minAmount: number;
  maxAmount: number | null;
  fixedAmount?: number;
  percentageRate?: number;
}

const CommissionEditor: React.FC<CommissionEditorProps> = ({ operationTypeId, rules }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<CommissionRule | null>(null);
  const [form, setForm] = useState({
    commission_type: "fixed" as "fixed" | "percentage" | "tiered",
    fixed_amount: "",
    percentage_rate: "",
    min_amount: "",
    max_amount: "",
  });
  const [tieredRules, setTieredRules] = useState<TieredRule[]>([
    { minAmount: 0, maxAmount: 1000, fixedAmount: 50 }
  ]);

  const createRule = useCreateCommissionRule();
  const updateRule = useUpdateCommissionRule();

  const handleOpenCreate = () => {
    setEditRule(null);
    setForm({
      commission_type: "fixed",
      fixed_amount: "",
      percentage_rate: "",
      min_amount: "",
      max_amount: "",
    });
    setTieredRules([{ minAmount: 0, maxAmount: 1000, fixedAmount: 50 }]);
    setModalOpen(true);
  };

  const handleOpenEdit = (rule: CommissionRule) => {
    setEditRule(rule);
    setForm({
      commission_type: rule.commission_type,
      fixed_amount: rule.fixed_amount?.toString() || "",
      percentage_rate: rule.percentage_rate ? (rule.percentage_rate * 100).toString() : "",
      min_amount: rule.min_amount?.toString() || "",
      max_amount: rule.max_amount?.toString() || "",
    });
    
    if (rule.commission_type === 'tiered' && rule.tiered_rules && Array.isArray(rule.tiered_rules)) {
      setTieredRules(rule.tiered_rules as TieredRule[]);
    }
    
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    if (form.commission_type === 'fixed' && !form.fixed_amount) {
      toast({ title: "Erreur", description: "Montant fixe requis", variant: "destructive" });
      return false;
    }
    if (form.commission_type === 'percentage' && !form.percentage_rate) {
      toast({ title: "Erreur", description: "Taux de pourcentage requis", variant: "destructive" });
      return false;
    }
    if (form.commission_type === 'tiered') {
      if (tieredRules.length === 0) {
        toast({ title: "Erreur", description: "Au moins un palier requis", variant: "destructive" });
        return false;
      }
      
      // Valider que les paliers ne se chevauchent pas
      for (let i = 0; i < tieredRules.length - 1; i++) {
        const current = tieredRules[i];
        const next = tieredRules[i + 1];
        if (current.maxAmount && next.minAmount <= current.maxAmount) {
          toast({ title: "Erreur", description: "Les paliers ne doivent pas se chevaucher", variant: "destructive" });
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const ruleData = {
        operation_type_id: operationTypeId,
        commission_type: form.commission_type,
        fixed_amount: form.fixed_amount ? parseFloat(form.fixed_amount) : null,
        percentage_rate: form.percentage_rate ? parseFloat(form.percentage_rate) / 100 : null,
        min_amount: parseFloat(form.min_amount) || 0,
        max_amount: form.max_amount ? parseFloat(form.max_amount) : null,
        tiered_rules: form.commission_type === 'tiered' ? tieredRules : [],
        is_active: true,
      };

      if (editRule) {
        await updateRule.mutateAsync({
          id: editRule.id,
          updates: ruleData,
        });
        toast({ title: "Succès", description: "Règle de commission modifiée." });
      } else {
        await createRule.mutateAsync(ruleData);
        toast({ title: "Succès", description: "Règle de commission créée." });
      }
      setModalOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const addTieredRule = () => {
    const lastRule = tieredRules[tieredRules.length - 1];
    const newMinAmount = lastRule?.maxAmount ? lastRule.maxAmount + 1 : 0;
    setTieredRules([...tieredRules, {
      minAmount: newMinAmount,
      maxAmount: newMinAmount + 1000,
      fixedAmount: 100
    }]);
  };

  const updateTieredRule = (index: number, field: keyof TieredRule, value: any) => {
    const newRules = [...tieredRules];
    if (field === 'maxAmount' && value === '') {
      newRules[index][field] = null;
    } else {
      newRules[index][field] = value === '' ? 0 : parseFloat(value) || 0;
    }
    setTieredRules(newRules);
  };

  const removeTieredRule = (index: number) => {
    if (tieredRules.length > 1) {
      setTieredRules(tieredRules.filter((_, i) => i !== index));
    }
  };

  const formatCommissionDisplay = (rule: CommissionRule) => {
    if (rule.commission_type === 'fixed') {
      return `${rule.fixed_amount} FCFA`;
    } else if (rule.commission_type === 'percentage') {
      return `${(rule.percentage_rate! * 100).toFixed(2)}%`;
    } else if (rule.commission_type === 'tiered') {
      const tieredRulesArray = rule.tiered_rules as TieredRule[];
      return `${tieredRulesArray?.length || 0} palier(s)`;
    }
    return 'Non défini';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Règles de Commission</CardTitle>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Règle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">
                  {rule.commission_type === 'fixed' && 'Commission Fixe'}
                  {rule.commission_type === 'percentage' && 'Commission Pourcentage'}
                  {rule.commission_type === 'tiered' && 'Commission par Paliers'}
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
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(rule)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              Aucune règle de commission définie.
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRule ? "Modifier la Règle" : "Nouvelle Règle de Commission"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Type de commission</Label>
              <Select value={form.commission_type} onValueChange={(value: "fixed" | "percentage" | "tiered") => setForm(f => ({ ...f, commission_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Commission Fixe</SelectItem>
                  <SelectItem value="percentage">Commission Pourcentage</SelectItem>
                  <SelectItem value="tiered">Commission par Paliers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.commission_type === 'fixed' && (
              <div>
                <Label>Montant fixe (FCFA)</Label>
                <Input 
                  type="number"
                  value={form.fixed_amount} 
                  onChange={e => setForm(f => ({ ...f, fixed_amount: e.target.value }))}
                  placeholder="100"
                />
              </div>
            )}

            {form.commission_type === 'percentage' && (
              <div>
                <Label>Taux de pourcentage (%)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={form.percentage_rate} 
                  onChange={e => setForm(f => ({ ...f, percentage_rate: e.target.value }))}
                  placeholder="2.5"
                />
              </div>
            )}

            {form.commission_type === 'tiered' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Configuration des Paliers</Label>
                  <Button type="button" variant="outline" onClick={addTieredRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un palier
                  </Button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Configuration des paliers :</p>
                      <p>Définissez des tranches de montants avec des commissions différentes. Les paliers doivent être ordonnés et ne pas se chevaucher.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {tieredRules.map((tier, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Palier {index + 1}</h4>
                        {tieredRules.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTieredRule(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Montant minimum (FCFA)</Label>
                          <Input 
                            type="number"
                            value={tier.minAmount}
                            onChange={e => updateTieredRule(index, 'minAmount', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Montant maximum (FCFA)</Label>
                          <Input 
                            type="number"
                            value={tier.maxAmount || ''}
                            onChange={e => updateTieredRule(index, 'maxAmount', e.target.value)}
                            placeholder="Laisser vide pour illimité"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Commission fixe (FCFA)</Label>
                          <Input 
                            type="number"
                            value={tier.fixedAmount || ''}
                            onChange={e => updateTieredRule(index, 'fixedAmount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Commission % (optionnel)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={tier.percentageRate ? tier.percentageRate * 100 : ''}
                            onChange={e => updateTieredRule(index, 'percentageRate', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.commission_type !== 'tiered' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant minimum (FCFA)</Label>
                  <Input 
                    type="number"
                    value={form.min_amount} 
                    onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Montant maximum (FCFA)</Label>
                  <Input 
                    type="number"
                    value={form.max_amount} 
                    onChange={e => setForm(f => ({ ...f, max_amount: e.target.value }))}
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editRule ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CommissionEditor;
