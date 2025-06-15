
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  OperationType,
  useOperationTypes,
  useOperationTypeFields,
  useCommissionRules,
  useCreateOperationType,
  useUpdateOperationType
} from "@/hooks/useOperationTypes";
import FieldEditor from "@/components/OperationTypes/FieldEditor";
import CommissionEditor from "@/components/OperationTypes/CommissionEditor";

const OperationTypesManagement = () => {
  const { data: operationTypes = [], isLoading, error } = useOperationTypes();
  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOperationType, setEditOperationType] = useState<OperationType | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedOperationType, setSelectedOperationType] = useState<OperationType | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    impacts_balance: true,
    is_active: true,
    status: "active" as "active" | "inactive" | "archived",
  });

  // Données pour la configuration
  const { data: fields = [] } = useOperationTypeFields(selectedOperationType?.id);
  const { data: commissionRules = [] } = useCommissionRules(selectedOperationType?.id);

  const handleOpenCreate = () => {
    setEditOperationType(null);
    setForm({
      name: "",
      description: "",
      impacts_balance: true,
      is_active: true,
      status: "active",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (operationType: OperationType) => {
    setEditOperationType(operationType);
    setForm({
      name: operationType.name,
      description: operationType.description,
      impacts_balance: operationType.impacts_balance,
      is_active: operationType.is_active,
      status: operationType.status,
    });
    setModalOpen(true);
  };

  const handleOpenConfig = (operationType: OperationType) => {
    setSelectedOperationType(operationType);
    setConfigModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description) {
      toast({ title: "Erreur", description: "Nom et description requis", variant: "destructive" });
      return;
    }

    try {
      if (editOperationType) {
        await updateOperationType.mutateAsync({
          id: editOperationType.id,
          ...form,
        });
        toast({ title: "Succès", description: "Type d'opération modifié." });
      } else {
        await createOperationType.mutateAsync(form);
        toast({ title: "Succès", description: "Type d'opération créé." });
      }
      setModalOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="secondary">Inactif</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Types d'Opérations</h1>
          <p className="text-gray-600">Configurez les services disponibles sur la plateforme</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Type d'Opération
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types d'Opérations Configurés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 text-sm">{error.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Impact Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationTypes.map((operationType) => (
                    <TableRow key={operationType.id}>
                      <TableCell className="font-medium">{operationType.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{operationType.description}</TableCell>
                      <TableCell>
                        {operationType.impacts_balance ? (
                          <Badge variant="outline">Oui</Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(operationType.status, operationType.is_active)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(operationType)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenConfig(operationType)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editOperationType ? "Modifier le Type d'Opération" : "Nouveau Type d'Opération"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: Transfert d'argent"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
              <Select value={form.status} onValueChange={(value: "active" | "inactive" | "archived") => setForm(f => ({ ...f, status: value }))}>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editOperationType ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuration */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuration - {selectedOperationType?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields">Champs du Formulaire</TabsTrigger>
              <TabsTrigger value="commission">Règles de Commission</TabsTrigger>
              <TabsTrigger value="general">Informations Générales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields" className="space-y-4">
              {selectedOperationType && (
                <FieldEditor 
                  operationTypeId={selectedOperationType.id} 
                  fields={fields} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="commission" className="space-y-4">
              {selectedOperationType && (
                <CommissionEditor 
                  operationTypeId={selectedOperationType.id} 
                  rules={commissionRules} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom</Label>
                      <p className="text-sm text-gray-600">{selectedOperationType?.name}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-gray-600">{selectedOperationType?.description}</p>
                    </div>
                    <div>
                      <Label>Impact sur le solde</Label>
                      <p className="text-sm text-gray-600">
                        {selectedOperationType?.impacts_balance ? "Oui" : "Non"}
                      </p>
                    </div>
                    <div>
                      <Label>Statut</Label>
                      <p className="text-sm text-gray-600">
                        {selectedOperationType && getStatusBadge(selectedOperationType.status, selectedOperationType.is_active)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationTypesManagement;
