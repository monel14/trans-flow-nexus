
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Settings, DollarSign, FileText } from 'lucide-react';

const OperationTypes = () => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');

  const [newOperationType, setNewOperationType] = useState({
    name: '',
    description: '',
    impactsBalance: true,
    isActive: true,
    commissionType: 'percentage',
    commissionValue: '',
    fields: [] as any[]
  });

  // Données mockées
  const operationTypes = [
    {
      id: 'western_union',
      name: 'Transfert Western Union',
      description: 'Transfert d\'argent international via Western Union',
      impactsBalance: true,
      isActive: true,
      commissionType: 'percentage',
      commissionValue: 2.5,
      fields: [
        { id: 'amount', label: 'Montant', type: 'number', required: true },
        { id: 'beneficiary', label: 'Nom du bénéficiaire', type: 'text', required: true },
        { id: 'country', label: 'Pays de destination', type: 'select', required: true },
        { id: 'mtcn', label: 'MTCN', type: 'text', required: false }
      ],
      createdDate: '2024-01-10'
    },
    {
      id: 'orange_money',
      name: 'Paiement Orange Money',
      description: 'Paiement via le service Orange Money',
      impactsBalance: true,
      isActive: true,
      commissionType: 'fixed',
      commissionValue: 500,
      fields: [
        { id: 'amount', label: 'Montant', type: 'number', required: true },
        { id: 'phone', label: 'Numéro de téléphone', type: 'tel', required: true },
        { id: 'reference', label: 'Référence', type: 'text', required: false }
      ],
      createdDate: '2024-01-10'
    },
    {
      id: 'bill_payment',
      name: 'Paiement de Facture',
      description: 'Paiement de factures diverses (SONABEL, ONEA, etc.)',
      impactsBalance: true,
      isActive: true,
      commissionType: 'tiered',
      commissionValue: 'Selon montant',
      fields: [
        { id: 'amount', label: 'Montant', type: 'number', required: true },
        { id: 'provider', label: 'Fournisseur', type: 'select', required: true },
        { id: 'account_number', label: 'Numéro de compte', type: 'text', required: true },
        { id: 'period', label: 'Période', type: 'text', required: false }
      ],
      createdDate: '2024-01-08'
    }
  ];

  const fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Téléphone' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'file', label: 'Fichier' },
    { value: 'date', label: 'Date' }
  ];

  const handleCreateOperationType = () => {
    if (!newOperationType.name || !newOperationType.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Type d'opération créé",
      description: `Le type "${newOperationType.name}" a été créé avec succès.`,
    });

    setNewOperationType({
      name: '',
      description: '',
      impactsBalance: true,
      isActive: true,
      commissionType: 'percentage',
      commissionValue: '',
      fields: []
    });
    setIsCreateModalOpen(false);
  };

  const addField = () => {
    setNewOperationType(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: `field_${Date.now()}`,
        label: '',
        type: 'text',
        required: false,
        options: []
      }]
    }));
  };

  const updateField = (index: number, field: any) => {
    setNewOperationType(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f)
    }));
  };

  const removeField = (index: number) => {
    setNewOperationType(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Types d'Opérations</h1>
          <p className="text-gray-600">Configurez les types d'opérations disponibles</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Type d'Opération</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Informations Générales</TabsTrigger>
                <TabsTrigger value="fields">Champs du Formulaire</TabsTrigger>
                <TabsTrigger value="commission">Commissions</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du Type d'Opération *</Label>
                  <Input
                    id="name"
                    value={newOperationType.name}
                    onChange={(e) => setNewOperationType(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Transfert Western Union"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newOperationType.description}
                    onChange={(e) => setNewOperationType(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du type d'opération"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newOperationType.impactsBalance}
                    onCheckedChange={(checked) => setNewOperationType(prev => ({ ...prev, impactsBalance: checked }))}
                  />
                  <Label>Cette opération impacte les soldes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newOperationType.isActive}
                    onCheckedChange={(checked) => setNewOperationType(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Type d'opération actif</Label>
                </div>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Champs du Formulaire</h3>
                  <Button onClick={addField} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un Champ
                  </Button>
                </div>
                
                {newOperationType.fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Libellé</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(index, { ...field, label: e.target.value })}
                            placeholder="Nom du champ"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(index, { ...field, type: value })}
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
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(index, { ...field, required: checked })}
                          />
                          <Label>Obligatoire</Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="commission" className="space-y-4">
                <div>
                  <Label>Type de Commission</Label>
                  <Select
                    value={newOperationType.commissionType}
                    onValueChange={(value) => setNewOperationType(prev => ({ ...prev, commissionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage</SelectItem>
                      <SelectItem value="fixed">Montant Fixe</SelectItem>
                      <SelectItem value="tiered">Par Paliers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newOperationType.commissionType === 'percentage' && (
                  <div>
                    <Label>Pourcentage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newOperationType.commissionValue}
                      onChange={(e) => setNewOperationType(prev => ({ ...prev, commissionValue: e.target.value }))}
                      placeholder="Ex: 2.5"
                    />
                  </div>
                )}
                
                {newOperationType.commissionType === 'fixed' && (
                  <div>
                    <Label>Montant Fixe (FCFA)</Label>
                    <Input
                      type="number"
                      value={newOperationType.commissionValue}
                      onChange={(e) => setNewOperationType(prev => ({ ...prev, commissionValue: e.target.value }))}
                      placeholder="Ex: 500"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2 mt-6">
              <Button onClick={handleCreateOperationType} className="flex-1">
                Créer le Type d'Opération
              </Button>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {operationTypes.length}
              </div>
              <div className="text-sm text-gray-600">Types Totaux</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {operationTypes.filter(t => t.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Types Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {operationTypes.filter(t => t.impactsBalance).length}
              </div>
              <div className="text-sm text-gray-600">Impactent Soldes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <div className="text-sm text-gray-600">Agences Utilisatrices</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des types d'opérations */}
      <Card>
        <CardHeader>
          <CardTitle>Types d'Opérations Configurés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Impact Soldes</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date Création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operationTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                    <TableCell>
                      {type.impactsBalance ? (
                        <Badge className="bg-green-100 text-green-800">Oui</Badge>
                      ) : (
                        <Badge variant="secondary">Non</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {type.commissionType === 'percentage' 
                        ? `${type.commissionValue}%`
                        : type.commissionType === 'fixed'
                        ? `${type.commissionValue} FCFA`
                        : 'Par paliers'
                      }
                    </TableCell>
                    <TableCell>
                      {type.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell>{type.createdDate}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Configurer">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Supprimer">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationTypes;
