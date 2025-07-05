
import React, { useState } from 'react';
import { useErrorLogs } from '@/hooks/useErrorLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Bug, 
  Info, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  Eye
} from 'lucide-react';

const ErrorLogs = () => {
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const { data: logsData, isLoading, error } = useErrorLogs({
    level: levelFilter,
    limit: limit,
  });

  // Handle the data structure - it should be an array of error logs
  const logs = Array.isArray(logsData) ? logsData : [];
  const totalCount = logs.length;
  const totalPages = Math.ceil(totalCount / limit);

  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value);
    setPage(1);
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="mr-2 h-4 w-4 animate-spin" /> Chargement des logs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" /> Erreur lors du chargement des logs.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Journaux d'erreurs</h1>
        <div className="space-x-2 flex items-center">
          <Input
            type="search"
            placeholder="Rechercher..."
            className="md:w-64"
            value={searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
          />
          <Select onValueChange={handleLevelFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les niveaux</SelectItem>
              <SelectItem value="error">Erreur</SelectItem>
              <SelectItem value="warn">Avertissement</SelectItem>
              <SelectItem value="info">Information</SelectItem>
              <SelectItem value="debug">Débogage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des journaux</CardTitle>
          <CardDescription>
            Affichage des erreurs, avertissements et informations du système.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs && logs.length > 0 ? (
            logs.map((log: any) => (
              <Card key={log.id} className="border">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {log.level === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {log.level === 'warn' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {log.level === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                    {log.level === 'debug' && <Bug className="h-4 w-4 text-gray-500" />}
                    <CardTitle className="text-sm font-medium">{log.message}</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <span className="font-semibold">Contexte:</span> {log.context || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Détails:</span> {log.details || 'N/A'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Aucun journal trouvé.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Total: {totalCount} journaux | Page {page} sur {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Suivant
          </Button>
          <Select value={limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Logs par page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 par page</SelectItem>
              <SelectItem value="20">20 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
              <SelectItem value="100">100 par page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogs;
