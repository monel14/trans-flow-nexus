import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperationTypes } from '@/hooks/useOperationTypes';
import { useCreateOperation } from '@/hooks/useOperations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { OperationTypeField } from '@/lib/schemas';

const NewOperation = () => {
  const navigate = useNavigate();
  const { data: operationTypes = [], isLoading } = useOperationTypes();
  const createOperation = useCreateOperation();
  
  const [selectedOperationType, setSelectedOperationType] = useState<string>('');
  const [operationData, setOperationData] = useState<Record<string, any>>({});
  const [amount, setAmount] = useState<number>(0);

  const renderFieldInput = (field: OperationTypeField) => {
    const value = operationData[field.name] || '';
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            type={field.field_type}
            value={value}
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            placeholder={field.placeholder}
            required={field.is_required}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: parseFloat(e.target.value) || 0
            }))}
            placeholder={field.placeholder}
            required={field.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            placeholder={field.placeholder}
            required={field.is_required}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => setOperationData(prev => ({
              ...prev,
              [field.name]: newValue
            }))}
            required={field.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={(checked) => setOperationData(prev => ({
              ...prev,
              [field.name]: checked
            }))}
            required={field.is_required}
          />
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => setOperationData(prev => ({
              ...prev,
              [field.name]: newValue
            }))}
          >
            {(field.options || []).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                <Label htmlFor={`${field.name}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            required={field.is_required}
          />
        );
      
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: e.target.files?.[0] || null
            }))}
            required={field.is_required}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setOperationData(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            placeholder={field.placeholder}
            required={field.is_required}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOperationType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type d'opération",
        variant: "destructive"
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    try {
      await createOperation.mutateAsync({
        operation_type_id: selectedOperationType,
        amount: amount,
        operation_data: operationData
      });

      toast({
        title: "Succès",
        description: "Opération créée avec succès"
      });

      navigate('/operations/history');
    } catch (error) {
      console.error('Error creating operation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'opération",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle Opération</h1>
        <p className="text-muted-foreground mt-2">
          Créez une nouvelle opération en remplissant les informations ci-dessous
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>
              Sélectionnez le type d'opération et saisissez le montant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="operation-type">Type d'opération *</Label>
              <Select
                value={selectedOperationType}
                onValueChange={setSelectedOperationType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type d'opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Montant (XOF) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="Entrez le montant"
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" disabled={createOperation.isPending}>
            {createOperation.isPending ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Créer l'opération
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOperation;
