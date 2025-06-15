
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Settings } from "lucide-react";
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
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="py-16 text-center text-gray-600">Chargement des types d'opérations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="py-8 text-center text-red-600 text-sm">
          Erreur lors du chargement: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
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
          {operationTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Aucun type d'opération configuré
              </TableCell>
            </TableRow>
          ) : (
            operationTypes.map((operationType) => (
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit?.(operationType)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onConfig?.(operationType)}
                      title="Configurer"
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
