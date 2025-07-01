import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOperationTypes, useCreateOperationType, useUpdateOperationType, useDeleteOperationType } from '@/hooks/useOperationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Plus,
  Edit,
  Trash2,
  FileText,
  Database,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Code
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import OperationTypeModalForm from '@/components/OperationTypes/OperationTypeModalForm';

const OperationTypesListPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État des modales
  const [selectedType, setSelectedType] = useState<any>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hooks
  const { data: operationTypes = [], isLoading } = useOperationTypes();
  const createOperationType = useCreateOperationType();
  const updateOperationType = useUpdateOperationType();
  const deleteOperationType = useDeleteOperationType();

  const handleCreate = () => {
    setSelectedType(null);
    setModalType('create');
  };

  const handleEdit = (operationType: any) => {
    setSelectedType(operationType);
    setModalType('edit');
  };

  const handleView = (operationType: any) => {
    setSelectedType(operationType);
    setModalType('view');
  };

  const handleDelete = async (operationType: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le type d'opération "${operationType.name}" ?\n\nCette action ne peut pas être annulée et pourrait affecter les opérations existantes.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteOperationType.mutateAsync(operationType.id);
      toast({
        title: "Type d'opération supprimé",
        description: "Le type d'opération a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (operationType: any) => {
    try {
      await updateOperationType.mutateAsync({
        id: operationType.id,
        updates: {
          is_active: !operationType.is_active
        }
      });
      
      toast({
        title: operationType.is_active ? "Type désactivé" : "Type activé",
        description: `Le type d'opération "${operationType.name}" a été ${operationType.is_active ? 'désactivé' : 'activé'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du statut",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Actif
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Inactif
          </>
        )}
      </Badge>
    );
  };

  const getImpactBadge = (affectsBalance: boolean) => {
    return (
      <Badge variant={affectsBalance ? "destructive" : "outline"}>
        {affectsBalance ? (
          <>
            <DollarSign className="h-3 w-3 mr-1" />
            Financière
          </>
        ) : (
          <>
            <FileText className="h-3 w-3 mr-1" />
            Informative
          </>
        )}
      </Badge>
    );
  };

  if (isLoading) {
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Gestion des Types d'Opérations
          </h1>
          <p className="text-gray-600 mt-2">
            Configurez les services et formulaires dynamiques de la plateforme
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Type
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {operationTypes.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Settings className="h-4 w-4" />
                Total Types
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {operationTypes.filter(t => t.is_active).length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Actifs
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {operationTypes.filter(t => t.affects_balance).length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <DollarSign className="h-4 w-4" />
                Financières
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {operationTypes.reduce((sum, t) => sum + (t.operation_type_fields?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Database className="h-4 w-4" />
                Champs Total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des types d'opérations */}
      <Card>
        <CardHeader>
          <CardTitle>Types d'Opérations Configurés</CardTitle>
        </CardHeader>
        <CardContent>
          {operationTypes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Champs</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationTypes.map((operationType) => (
                    <TableRow key={operationType.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{operationType.name}</span>
                          <span className="text-sm text-gray-500">ID: {operationType.id.slice(-8)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={operationType.description}>
                          {operationType.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getImpactBadge(operationType.affects_balance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">
                            {operationType.operation_type_fields?.length || 0}
                          </span>
                          <span className="text-sm text-gray-500">champs</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-semibold">
                            {operationType.commission_rules?.length || 0}
                          </span>
                          <span className="text-sm text-gray-500">règles</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(operationType.is_active)}
                          <Switch
                            checked={operationType.is_active}
                            onCheckedChange={() => handleToggleStatus(operationType)}
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(operationType.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(operationType)}
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(operationType)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(operationType)}
                            disabled={isDeleting}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun type d'opération configuré</h3>
              <p className="mb-4">Créez votre premier type d'opération pour commencer</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un type d'opération
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de détail (lecture seule) */}
      <Dialog open={modalType === 'view'} onOpenChange={() => {
        setModalType(null);
        setSelectedType(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails du Type d'Opération
            </DialogTitle>
          </DialogHeader>
          
          {selectedType && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom</label>
                  <p className="font-semibold">{selectedType.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedType.is_active)}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p>{selectedType.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Impact sur les soldes</label>
                  <div className="mt-1">
                    {getImpactBadge(selectedType.affects_balance)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de création</label>
                  <p>{formatDate(selectedType.created_at)}</p>
                </div>
              </div>

              {/* Champs du formulaire */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Champs du Formulaire ({selectedType.operation_type_fields?.length || 0})
                </h4>
                {selectedType.operation_type_fields && selectedType.operation_type_fields.length > 0 ? (
                  <div className="space-y-3">
                    {selectedType.operation_type_fields.map((field: any, index: number) => (
                      <div key={field.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Libellé</span>
                            <p className="font-medium">{field.label}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Type</span>
                            <Badge variant="outline">{field.field_type}</Badge>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Requis</span>
                            <Badge variant={field.is_required ? "destructive" : "secondary"}>
                              {field.is_required ? 'Obligatoire' : 'Optionnel'}
                            </Badge>
                          </div>
                        </div>
                        {field.help_text && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-500">Aide</span>
                            <p className="text-sm text-gray-600">{field.help_text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucun champ configuré</p>
                )}
              </div>

              {/* Règles de commission */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Règles de Commission ({selectedType.commission_rules?.length || 0})
                </h4>
                {selectedType.commission_rules && selectedType.commission_rules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedType.commission_rules.map((rule: any) => (
                      <div key={rule.id} className="p-3 border rounded-lg bg-green-50">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Type de règle</span>
                            <Badge variant="outline">
                              {rule.rule_type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Valeur</span>
                            <p className="font-semibold">
                              {rule.rule_type === 'percentage' 
                                ? `${rule.percentage}%`
                                : `${rule.fixed_amount} FCFA`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucune règle de commission configurée</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale de création/édition */}
      <OperationTypeModalForm
        isOpen={modalType === 'create' || modalType === 'edit'}
        onClose={() => {
          setModalType(null);
          setSelectedType(null);
        }}
        operationType={selectedType}
        mode={modalType === 'create' ? 'create' : 'edit'}
      />
    </div>
  );
};

export default OperationTypesListPage;