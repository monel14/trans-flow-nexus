
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, AlertCircle } from "lucide-react";
import { CommissionRule } from "@/hooks/useOperationTypes";

interface CommissionConfigFormProps {
  rule?: CommissionRule | null;
  onSave: (ruleData: Partial<CommissionRule>) => void;
  onCancel: () => void;
  operationTypeId: string;
}

interface TieredRule {
  minAmount: number;
  maxAmount: number | null;
  fixedAmount?: number;
  percentageRate?: number;
}

const CommissionConfigForm: React.FC<CommissionConfigFormProps> = ({
  rule,
  onSave,
  onCancel,
  operationTypeId
}) => {
  const [formData, setFormData] = useState({
    commission_type: rule?.commission_type || "fixed" as "fixed" | "percentage" | "tiered",
    fixed_amount: rule?.fixed_amount?.toString() || "",
    percentage_rate: rule?.percentage_rate ? (rule.percentage_rate * 100).toString() : "",
    min_amount: rule?.min_amount?.toString() || "0",
    max_amount: rule?.max_amount?.toString() || "",
    is_active: rule?.is_active ?? true
  });

  const [tieredRules, setTieredRules] = useState<TieredRule[]>(
    rule?.tiered_rules && Array.isArray(rule.tiered_rules) 
      ? rule.tiered_rules as TieredRule[]
      : [{ minAmount: 0, maxAmount: 1000, fixedAmount: 100 }]
  );

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

  const validateForm = (): boolean => {
    if (formData.commission_type === 'fixed' && !formData.fixed_amount) {
      alert("Montant fixe requis");
      return false;
    }
    if (formData.commission_type === 'percentage' && !formData.percentage_rate) {
      alert("Taux de pourcentage requis");
      return false;
    }
    if (formData.commission_type === 'tiered') {
      if (tieredRules.length === 0) {
        alert("Au moins un palier requis");
        return false;
      }
      
      // Valider que les paliers ne se chevauchent pas
      for (let i = 0; i < tieredRules.length - 1; i++) {
        const current = tieredRules[i];
        const next = tieredRules[i + 1];
        if (current.maxAmount && next.minAmount <= current.maxAmount) {
          alert("Les paliers ne doivent pas se chevaucher");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const ruleData = {
      operation_type_id: operationTypeId,
      commission_type: formData.commission_type,
      fixed_amount: formData.fixed_amount ? parseFloat(formData.fixed_amount) : null,
      percentage_rate: formData.percentage_rate ? parseFloat(formData.percentage_rate) / 100 : null,
      min_amount: parseFloat(formData.min_amount) || 0,
      max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
      tiered_rules: formData.commission_type === 'tiered' ? tieredRules : [],
      is_active: formData.is_active,
    };

    onSave(ruleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {rule ? "Modifier la Règle de Commission" : "Nouvelle Règle de Commission"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Type de Commission *</Label>
            <Select 
              value={formData.commission_type} 
              onValueChange={(value: "fixed" | "percentage" | "tiered") => 
                setFormData({...formData, commission_type: value})
              }
            >
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

          {formData.commission_type === 'fixed' && (
            <div className="space-y-2">
              <Label htmlFor="fixed_amount">Montant Fixe (FCFA) *</Label>
              <Input
                id="fixed_amount"
                type="number"
                value={formData.fixed_amount}
                onChange={(e) => setFormData({...formData, fixed_amount: e.target.value})}
                placeholder="100"
                required
              />
            </div>
          )}

          {formData.commission_type === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="percentage_rate">Taux de Pourcentage (%) *</Label>
              <Input
                id="percentage_rate"
                type="number"
                step="0.01"
                value={formData.percentage_rate}
                onChange={(e) => setFormData({...formData, percentage_rate: e.target.value})}
                placeholder="2.5"
                required
              />
            </div>
          )}

          {formData.commission_type === 'tiered' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Configuration des Paliers</Label>
                <Button type="button" variant="outline" onClick={addTieredRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Palier
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
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Palier {index + 1}</h4>
                      {tieredRules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTieredRule(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label>Montant minimum (FCFA)</Label>
                        <Input
                          type="number"
                          value={tier.minAmount}
                          onChange={(e) => updateTieredRule(index, 'minAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Montant maximum (FCFA)</Label>
                        <Input
                          type="number"
                          value={tier.maxAmount || ''}
                          onChange={(e) => updateTieredRule(index, 'maxAmount', e.target.value)}
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
                          onChange={(e) => updateTieredRule(index, 'fixedAmount', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Commission % (optionnel)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={tier.percentageRate ? tier.percentageRate * 100 : ''}
                          onChange={(e) => updateTieredRule(index, 'percentageRate', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {formData.commission_type !== 'tiered' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant minimum (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Montant maximum (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                  placeholder="Optionnel"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
            />
            <Label htmlFor="is_active">Règle active</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {rule ? "Mettre à Jour" : "Créer la Règle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommissionConfigForm;
