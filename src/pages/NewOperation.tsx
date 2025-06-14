
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Calculator } from 'lucide-react';

const NewOperation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [operationType, setOperationType] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    beneficiary: '',
    reference: '',
    comment: ''
  });
  const [proof, setProof] = useState<File | null>(null);

  const operationTypes = [
    { id: 'western_union', name: 'Transfert Western Union', commission: 2.5 },
    { id: 'orange_money', name: 'Paiement Orange Money', commission: 1.5 },
    { id: 'moov_money', name: 'Recharge Moov Money', commission: 1.0 },
    { id: 'wave', name: 'Transfert Wave', commission: 1.0 },
    { id: 'facture', name: 'Paiement Facture', commission: 2.0 }
  ];

  const selectedOperation = operationTypes.find(op => op.id === operationType);
  const estimatedCommission = selectedOperation && formData.amount ? 
    (parseFloat(formData.amount) * selectedOperation.commission / 100) : 0;
  const totalDebit = formData.amount ? parseFloat(formData.amount) + estimatedCommission : 0;
  const balanceAfter = user?.balance ? user.balance - totalDebit : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationType || !formData.amount || !proof) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et télécharger une preuve.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Opération soumise",
      description: "Votre opération a été soumise pour validation.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProof(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Opération</h1>
        <p className="text-gray-600">Initier une nouvelle transaction</p>
      </div>

      {/* Solde actuel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Votre Solde Actuel :</span>
            <span className="text-xl font-bold text-green-600">
              {user?.balance?.toLocaleString()} FCFA
            </span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'Opération</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="operation-type">Type d'Opération *</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type d'opération" />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} (Commission: {type.commission}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {operationType && (
              <>
                <div>
                  <Label htmlFor="amount">Montant *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiary">Numéro Bénéficiaire / Référence *</Label>
                  <Input
                    id="beneficiary"
                    value={formData.beneficiary}
                    onChange={(e) => setFormData(prev => ({ ...prev, beneficiary: e.target.value }))}
                    placeholder="Ex: +226 70 XX XX XX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Référence Externe</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Référence de la transaction"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Commentaire</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Commentaire optionnel"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="proof">Preuve de Transaction *</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('proof')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{proof ? proof.name : 'Télécharger une preuve'}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {operationType && formData.amount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Montant de l'opération :</span>
                <span>{parseFloat(formData.amount).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Commission estimée :</span>
                <span>{estimatedCommission.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total à débiter :</span>
                <span>{totalDebit.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Solde après opération :</span>
                <span className={balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {balanceAfter.toLocaleString()} FCFA
                </span>
              </div>
              {balanceAfter < 0 && (
                <p className="text-sm text-red-600">
                  ⚠️ Solde insuffisant pour cette opération
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            disabled={!operationType || !formData.amount || !proof || balanceAfter < 0}
            className="flex-1"
          >
            Soumettre pour Validation
          </Button>
          <Button type="button" variant="outline" className="flex-1">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOperation;
