import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  useOperationTypes, 
  useUpdateOperationType, 
  OperationType 
} from '@/hooks/useOperationTypes';
import { Skeleton } from '@/components/ui/skeleton';

const OperationTypesListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: operationTypes = [], 
    isLoading, 
    error 
  } = useOperationTypes();
  const updateOperationType = useUpdateOperationType();

  const filteredTypes = operationTypes.filter((type: OperationType) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-500">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBalanceImpact = (impactsBalance: boolean) => {
    return impactsBalance ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Impacte Solde
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        Sans Impact
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Erreur lors du chargement des types d'opérations</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types d'Opérations</h1>
          <p className="text-gray-600 mt-1">
            Gérer les types d'opérations disponibles dans le système
          </p>
        </div>
        <Button 
          onClick={() => navigate('/operation-types/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un Type
        </Button>
      </div>

      {/* Barre de recherche et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : operationTypes.length}
              </div>
              <div className="text-sm text-gray-600">Total Types</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : 
                  operationTypes.filter(t => t.status === 'active').length}  
              </div>
              <div className="text-sm text-gray-600">Actifs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <Input
              placeholder="Rechercher un type d'opération..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tableau des types d'opérations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Liste des Types d'Opérations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Impact Solde</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Champs</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Aucun type trouvé pour cette recherche' : 'Aucun type d\'opération configuré'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {type.description || 'Aucune description'}
                      </TableCell>
                      <TableCell>{getBalanceImpact(type.impacts_balance)}</TableCell>
                      <TableCell>{getStatusBadge(type.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          0 champs
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(type.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir menu</span>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/operation-types/${type.id}`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Éditer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Implémenter toggle status
                                console.log('Toggle status', type.id);
                              }}
                            >
                              {type.status === 'active' ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                // TODO: Implémenter suppression
                                console.log('Delete', type.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationTypesListPage;