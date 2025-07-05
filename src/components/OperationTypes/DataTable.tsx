
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Settings, AlertCircle } from "lucide-react";
import { useOperationTypes, OperationType } from "@/hooks/useOperationTypes";

interface DataTableProps {
  onEdit?: (operationType: OperationType) => void;
  onConfig?: (operationType: OperationType) => void;
}

const DataTable: React.FC<DataTableProps> = ({ onEdit, onConfig }) => {
  const { data: operationTypes = [], isLoading, error } = useOperationTypes();

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="secondary">Inactif</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des types d'opérations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-sm font-medium mb-2">
            Erreur lors du chargement
          </p>
          <p className="text-gray-600 text-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Nom</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold text-center">Impact Solde</TableHead>
            <TableHead className="font-semibold text-center">Statut</TableHead>
            <TableHead className="font-semibold">Créé le</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operationTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Settings className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-gray-500 font-medium">Aucun type d'opération</p>
                    <p className="text-gray-400 text-sm">Créez votre premier type d'opération</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            operationTypes.map((operationType) => (
              <TableRow key={operationType.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold text-gray-900">{operationType.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2" title={operationType.description}>
                      {operationType.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {operationType.impacts_balance ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Oui
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Non</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(operationType.status, operationType.is_active)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(operationType.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit?.(operationType)}
                      title="Modifier ce type d'opération"
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onConfig?.(operationType)}
                      title="Configurer les champs et commissions"
                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
