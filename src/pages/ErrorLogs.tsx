import React, { useState } from 'react';
import { useErrorLogs, useErrorLogsStats, useClearErrorLogs, useResolveErrorLog } from '@/hooks/useErrorLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, X, FileText, Filter, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ErrorLogs = () => {
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  // Hooks
  const { data: logs, isLoading, refetch } = useErrorLogs({
    level: levelFilter,
    source: sourceFilter,
    resolved: resolvedFilter,
    limit: 50,
  });
  const { data: stats, isLoading: statsLoading } = useErrorLogsStats();
  const clearErrorLogsMutation = useClearErrorLogs();
  const resolveErrorLogMutation = useResolveErrorLog();

  const handleClearLogs = async (olderThanDays: number) => {
    try {
      await clearErrorLogsMutation.mutateAsync({ olderThanDays });
      toast({
        title: "Logs effacés",
        description: `Les logs de plus de ${olderThanDays} jours ont été supprimés.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression des logs.",
        variant: "destructive",
      });
    }
  };

  const handleOpenResolveDialog = (log: any) => {
    setSelectedLog(log);
    setResolutionNotes(log.resolution_notes || '');
    setResolveDialogOpen(true);
  };

  const handleResolveLog = async () => {
    if (!selectedLog) return;

    try {
      await resolveErrorLogMutation.mutateAsync({
        logId: selectedLog.id,
        resolution_notes: resolutionNotes,
      });
      setResolveDialogOpen(false);
      setSelectedLog(null);
      setResolutionNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la résolution du log.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date inconnue";
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Journaux d'Erreurs</h2>
          <p className="text-muted-foreground">
            Surveillez et gérez les erreurs système.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Erreurs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_errors || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.critical_errors || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Résolues</CardTitle>
            <X className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.unresolved_errors || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.errors_today || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Affinez la liste des erreurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="level">Niveau</Label>
            <Select onValueChange={setLevelFilter}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="debug">Débogage</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              type="text"
              placeholder="Filtrer par source..."
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="resolved">Statut</Label>
            <Select onValueChange={(value) => setResolvedFilter(value === '' ? undefined : value === 'true')}>
              <SelectTrigger id="resolved">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="true">Résolues</SelectItem>
                <SelectItem value="false">Non résolues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Effectuez des actions groupées.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Effacer les anciens logs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Effacer les anciens logs</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer les logs plus anciens que...
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="days">Nombre de jours</Label>
                  <Select onValueChange={(days) => handleClearLogs(parseInt(days))}>
                    <SelectTrigger id="days">
                      <SelectValue placeholder="Sélectionnez le nombre de jours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Annuler
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Liste des Erreurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Liste des Erreurs ({logs?.length || 0})
          </CardTitle>
          <CardDescription>
            Détails des erreurs système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="py-2">Niveau</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Message</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2">
                      <Badge
                        variant={
                          log.level === 'error' || log.level === 'critical'
                            ? 'destructive'
                            : log.level === 'warning'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {log.level}
                      </Badge>
                    </td>
                    <td className="py-2">{log.source}</td>
                    <td className="py-2">{log.message.substring(0, 100)}...</td>
                    <td className="py-2">{formatDate(log.created_at)}</td>
                    <td className="py-2">
                      <Button size="sm" onClick={() => handleOpenResolveDialog(log)}>
                        {log.resolved ? 'Voir' : 'Résoudre'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Résolution */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLog?.resolved ? 'Détails du Log' : 'Résoudre le Log'}
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.resolved
                ? 'Informations sur le log et sa résolution.'
                : 'Ajoutez des notes de résolution et marquez le log comme résolu.'}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={selectedLog.message}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context">Contexte</Label>
                  <Textarea
                    id="context"
                    value={JSON.stringify(selectedLog.context, null, 2)}
                    readOnly
                    className="bg-gray-100"
                    rows={4}
                  />
                </div>
                {!selectedLog.resolved && (
                  <div className="space-y-2">
                    <Label htmlFor="resolution_notes">Notes de Résolution</Label>
                    <Textarea
                      id="resolution_notes"
                      placeholder="Ajoutez des notes sur la résolution..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>
                )}
                {selectedLog.resolved && selectedLog.resolution_notes && (
                  <div className="space-y-2">
                    <Label htmlFor="resolution_notes">Notes de Résolution</Label>
                    <Textarea
                      id="resolution_notes"
                      value={selectedLog.resolution_notes}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setResolveDialogOpen(false)}>
              Fermer
            </Button>
            {!selectedLog?.resolved && (
              <Button type="submit" onClick={handleResolveLog}>
                Marquer comme Résolu
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogs;
