
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Settings, Search, Filter } from "lucide-react";
import { OperationType, useOperationTypes } from "@/hooks/useOperationTypes";
import OperationTypeModalForm from "./OperationTypeModalForm";

const OperationTypesList = () => {
  const { data: operationTypes = [], isLoading } = useOperationTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editOperationType, setEditOperationType] = useState<OperationType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOperationTypes = operationTypes.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         op.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditOperationType(null);
    setModalOpen(true);
  };

  const handleEdit = (operationType: OperationType) => {
    setEditOperationType(operationType);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditOperationType(null);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Types d'Opérations</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Type
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Types d'Opérations</h1>
          <p className="text-gray-600">
            Configurez les services disponibles sur la plateforme
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Type d'Opération
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un type d'opération..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des types d'opérations */}
      <Card>
        <CardHeader>
          <CardTitle>
            Types d'Opérations Configurés ({filteredOperationTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOperationTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <Settings className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun type d'opération trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Aucun résultat ne correspond à vos critères de recherche."
                  : "Commencez par créer votre premier type d'opération."
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le Premier Type
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Impact Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperationTypes.map((operationType) => (
                    <TableRow key={operationType.id}>
                      <TableCell className="font-medium">
                        {operationType.name}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={operationType.description}>
                          {operationType.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {operationType.impacts_balance ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(operationType.status, operationType.is_active)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(operationType.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(operationType)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
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

      <OperationTypeModalForm 
        isOpen={modalOpen} 
        onClose={handleClose}
        operationType={editOperationType}
      />
    </div>
  );
};

export default OperationTypesList;
