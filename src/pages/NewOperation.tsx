import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperationTypes } from '@/hooks/useOperationTypes';
import { useOperations } from '@/hooks/useOperations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Calculator, 
  AlertTriangle, 
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface OperationTypeField {
  id: string;
  name: string;
  label: string;
  field_type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: { value: string; label: string }[];
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

const NewOperation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Hooks
  const { data: operationTypes, isLoading: loadingTypes } = useOperationTypes(user?.agenceId);
  const { createOperation, isCreating } = useOperations();

  // État du formulaire
  const [selectedType, setSelectedType] = useState<string>('');
  const [operationAmount, setOperationAmount] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les détails du type d'opération sélectionné
  const selectedOperationType = operationTypes?.find(type => type.id === selectedType);
  
  // Calculer la commission estimée (simplifié - devrait utiliser les commission_rules)
  const estimatedCommission = operationAmount * 0.02; // 2% par défaut
  const totalToDebit = operationAmount + estimatedCommission;
  const balanceAfter = (user?.balance || 0) - totalToDebit;
  const hasInsufficientBalance = balanceAfter < 0;

  // Réinitialiser le formulaire quand le type change
  useEffect(() => {
    setFormData({});
    setOperationAmount(0);
    setProofFile(null);
  }, [selectedType]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Si c'est le champ montant, mettre à jour operationAmount
    if (fieldName === 'amount' || fieldName === 'montant') {
      setOperationAmount(parseFloat(value) || 0);
    }
  };

  const renderField = (field: OperationTypeField) => {
    const value = formData[field.name] || '';
    
    const baseProps = {
      id: field.name,
      required: field.is_required,
      placeholder: field.placeholder,
      onChange: (e: any) => handleFieldChange(field.name, e.target.value)
    };

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            value={value}
            className="min-h-[100px]"
          />
        );
        
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Sélectionner..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'file':
        return (
          <Input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setProofFile(file);
                handleFieldChange(field.name, file.name);
              }
            }}
          />
        );
        
      default:
        return (
          <Input
            {...baseProps}
            type={field.field_type}
            value={value}
          />
        );
    }
  };

  const validateForm = () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type d'opération",
        variant: "destructive"
      });
      return false;
    }

    if (hasInsufficientBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour cette opération",
        variant: "destructive"
      });
      return false;
    }

    // Vérifier les champs requis
    const requiredFields = selectedOperationType?.operation_type_fields?.filter(f => f.is_required) || [];
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        toast({
          title: "Champ manquant",
          description: `Le champ "${field.label}" est requis`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const operationData = {
        operation_type_id: selectedType,
        amount: operationAmount,
        operation_data: formData,
        agency_id: user?.agenceId,
        initiator_id: user?.id,
        // TODO: Upload du fichier preuve et ajouter l'URL
      };

      await createOperation(operationData);
      
      toast({
        title: "Opération créée",
        description: "Votre opération a été soumise pour validation",
      });
      
      navigate('/operations/history');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'opération",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des types d'opérations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Nouvelle Opération
        </h1>
        <p className="text-gray-600 mt-2">
          Initiez une nouvelle transaction en remplissant les informations ci-dessous
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du type d'opération */}
        <Card>
          <CardHeader>
            <CardTitle>Type d'Opération</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="operation-type">Sélectionnez le service à traiter *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type d'opération..." />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-sm text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire dynamique */}
        {selectedType && selectedOperationType && (
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'Opération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOperationType.operation_type_fields?.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-1">
                      {field.label}
                      {field.is_required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.help_text && (
                      <p className="text-sm text-gray-500">{field.help_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload de preuve */}
        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Preuve de Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="proof">Joindre une preuve (image, PDF, document)</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setProofFile(file || null);
                  }}
                />
                {proofFile && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">{proofFile.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Récapitulatif financier */}
        {selectedType && operationAmount > 0 && (
          <Card className={hasInsufficientBalance ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Récapitulatif Financier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Votre solde actuel :</span>
                    <span className="font-semibold">{formatCurrency(user?.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant de l'opération :</span>
                    <span className="font-semibold">{formatCurrency(operationAmount)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Commission estimée :</span>
                    <span className="font-semibold">+{formatCurrency(estimatedCommission)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total à débiter :</span>
                    <span>{formatCurrency(totalToDebit)}</span>
                  </div>
                  <div className={`flex justify-between text-lg font-bold ${hasInsufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Solde après opération :</span>
                    <span>{formatCurrency(balanceAfter)}</span>
                  </div>
                  
                  {hasInsufficientBalance && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Solde insuffisant</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={!selectedType || hasInsufficientBalance || isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Soumission...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Soumettre pour Validation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOperation;