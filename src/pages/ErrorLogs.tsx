import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorLogs, useClearErrorLogs, useResolveErrorLog, useErrorLogStats } from '@/hooks/useErrorLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Bug,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Download,
  Filter,
  Calendar,
  Server,
  Database,
  Code,
  CheckCircle,
  XCircle,
  Shield,
  Globe,
  Laptop
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ErrorLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État des filtres
  const [filters, setFilters] = useState({
    level: 'all',
    source: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    resolved: undefined as boolean | undefined
  });
  
  // État des modales
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Hooks
  const { data: errorLogs = [], isLoading, refetch } = useErrorLogs(filters);
  const { data: stats } = useErrorLogStats();
  const clearLogs = useClearErrorLogs();
  const resolveLog = useResolveErrorLog();

  const getLevelBadge = (level: string) => {
    const variants = {
      'critical': 'bg-purple-100 text-purple-800 border-purple-300',
      'error': 'bg-red-100 text-red-800 border-red-300',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'info': 'bg-blue-100 text-blue-800 border-blue-300',
      'debug': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const icons = {
      'critical': AlertTriangle,
      'error': AlertTriangle,
      'warning': AlertTriangle,
      'info': Bug,
      'debug': Code
    };
    
    const Icon = icons[level as keyof typeof icons] || Bug;

    return (
      <Badge className={variants[level as keyof typeof variants] || variants.error}>
        <Icon className="h-3 w-3 mr-1" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      'api': Server,
      'database': Database,
      'frontend': Laptop,
      'system': Bug,
      'external': Globe
    };
    
    const Icon = icons[source as keyof typeof icons] || Bug;
    return <Icon className="h-4 w-4" />;
  };

  const handleViewDetail = (log: any) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleResolveLog = (log: any) => {
    setSelectedLog(log);
    setResolutionNotes('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedLog) return;

    try {
      await resolveLog.mutateAsync({
        logId: selectedLog.id,
        resolutionNotes: resolutionNotes || undefined
      });
      setIsResolveModalOpen(false);
      toast({
        title: "Log résolu",
        description: "Le log d'erreur a été marqué comme résolu",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la résolution du log",
        variant: "destructive"
      });
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action ne peut pas être annulée.')) {
      return;
    }

    try {
      await clearLogs.mutateAsync({ beforeDate: new Date().toISOString() });
      toast({
        title: "Logs supprimés",
        description: "Tous les logs ont été supprimés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression des logs",
        variant: "destructive"
      });
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Source', 'Message', 'User', 'Resolved', 'Context'].join(','),
      ...errorLogs.map(log => [
        log.timestamp,
        log.level,
        log.source,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_name || 'Système',
        log.resolved ? 'Oui' : 'Non',
        `"${JSON.stringify(log.context || {}).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const updateFilter = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des logs d'erreurs...</p>
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
            <Bug className="h-8 w-8" />
            Journaux d'Erreurs Système
          </h1>
          <p className="text-gray-600 mt-2">
            Surveillez et diagnostiquez les erreurs de l'application
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="destructive" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Vider les logs
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.critical || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Shield className="h-4 w-4" />
                Critiques
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats?.errors || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Erreurs
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.warnings || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Avertissements
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.unresolved || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                Non résolus
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.today || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Aujourd'hui
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Message d'erreur..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={filters.level} onValueChange={(value) => updateFilter('level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={(value) => updateFilter('source', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Base de données</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                  <SelectItem value="external">Externe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select 
                value={filters.resolved === undefined ? 'all' : filters.resolved ? 'resolved' : 'unresolved'} 
                onValueChange={(value) => updateFilter('resolved', 
                  value === 'all' ? undefined : value === 'resolved'
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                  <SelectItem value="unresolved">Non résolus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">Date de début</Label>
              <Input
                id="date-from"
                type="datetime-local"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-to">Date de fin</Label>
              <Input
                id="date-to"
                type="datetime-local"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs d'Erreurs ({errorLogs.length} entrées)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((log) => (
                    <TableRow key={log.id} className={log.resolved ? 'opacity-60' : ''}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(log.level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(log.source)}
                          <span className="capitalize">{log.source}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate" title={log.message}>
                          {log.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        {log.user_id ? (
                          <div className="flex flex-col">
                            <span className="text-sm">{log.user_name || 'Utilisateur'}</span>
                            <span className="text-xs text-gray-500">{log.user_id.slice(-8)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Système</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.resolved ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Résolu
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {log.resolved_at && (
                                <p>Résolu le {formatDate(log.resolved_at)}</p>
                              )}
                              {log.resolution_notes && (
                                <p className="mt-1 text-xs">{log.resolution_notes}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <XCircle className="h-3 w-3 mr-1" />
                            Non résolu
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!log.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveLog(log)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bug className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun log trouvé</h3>
              <p className="mb-4">
                {Object.values(filters).some(f => f && f !== 'all')
                  ? 'Aucun log ne correspond aux filtres sélectionnés'
                  : 'Aucun log d\'erreur enregistré'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de détail */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Détail du Log d'Erreur
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Timestamp</Label>
                  <p className="font-mono">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Niveau</Label>
                  <div className="mt-1">
                    {getLevelBadge(selectedLog.level)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Source</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getSourceIcon(selectedLog.source)}
                    <span className="capitalize">{selectedLog.source}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Utilisateur</Label>
                  <p>{selectedLog.user_name || selectedLog.user_id || 'Système'}</p>
                </div>
              </div>

              {/* Message d'erreur */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Message d'erreur</Label>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-mono text-sm">{selectedLog.message}</p>
                </div>
              </div>

              {/* Stack trace */}
              {selectedLog.stack_trace && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Stack Trace</Label>
                  <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-32">
                      {selectedLog.stack_trace}
                    </pre>
                  </div>
                </div>
              )}

              {/* Contexte */}
              {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contexte</Label>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <pre className="text-sm text-blue-800 whitespace-pre-wrap overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.context, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Résolution */}
              {selectedLog.resolved && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Résolution</Label>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Résolu le {selectedLog.resolved_at && formatDate(selectedLog.resolved_at)}
                      </span>
                    </div>
                    {selectedLog.resolution_notes && (
                      <p className="text-sm text-green-700">{selectedLog.resolution_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* URL et requête HTTP si applicable */}
              {selectedLog.request_url && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">URL de la requête</Label>
                  <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                    <p className="font-mono text-sm break-all">{selectedLog.request_url}</p>
                  </div>
                </div>
              )}

              {selectedLog.request_method && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Méthode HTTP</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedLog.request_method}
                    </Badge>
                  </div>
                  {selectedLog.response_status && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status HTTP</Label>
                      <Badge 
                        variant={selectedLog.response_status >= 400 ? "destructive" : "default"}
                        className="mt-1"
                      >
                        {selectedLog.response_status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale de résolution */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme résolu</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="resolution-notes">Notes de résolution (optionnel)</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Décrivez comment cette erreur a été résolue..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmResolve}
              disabled={resolveLog.isPending}
            >
              {resolveLog.isPending ? 'Résolution...' : 'Marquer comme résolu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogs;