
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, CheckCircle, Users, TrendingUp, FileText } from 'lucide-react';
import { useSousAdminDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';

const SousAdminDashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useSousAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">Impossible de charger les données du tableau de bord.</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-600">Aucune donnée disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (count: number) => {
    if (count === 0) return 'text-green-600';
    if (count <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord - Sous Admin</h2>
          <p className="text-muted-foreground">
            Bienvenue {user?.name}, voici un aperçu de vos responsabilités.
          </p>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUrgencyColor(dashboardData.pending_urgent || 0)}`}>
              {dashboardData.pending_urgent || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traités Aujourd'hui</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.completed_today || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Dossiers traités ce jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Support</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.support_tickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData.avg_processing_time || '0'}h
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de traitement moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignations et Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mes Assignations
            </CardTitle>
            <CardDescription>Tâches qui me sont assignées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.my_assignments && dashboardData.my_assignments.length > 0 ? (
              dashboardData.my_assignments.map((assignment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{assignment.title || `Tâche ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Assigné par: {Array.isArray(assignment.assigned_by) ? assignment.assigned_by[0]?.name || 'Inconnu' : assignment.assigned_by?.name || 'Inconnu'}
                    </p>
                  </div>
                  <Badge variant={assignment.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {assignment.priority || 'normal'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucune assignation en cours</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Hebdomadaire
            </CardTitle>
            <CardDescription>Objectifs et progression</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tâches Complétées</span>
                <span className="text-sm text-muted-foreground">
                  {dashboardData.completed_today || 0}/10
                </span>
              </div>
              <Progress 
                value={((dashboardData.completed_today || 0) / 10) * 100} 
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tickets Résolus</span>
                <span className="text-sm text-muted-foreground">
                  {Math.max(0, 15 - (dashboardData.support_tickets || 0))}/15
                </span>
              </div>
              <Progress 
                value={((Math.max(0, 15 - (dashboardData.support_tickets || 0))) / 15) * 100} 
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Délais Respectés</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Voir les Tickets
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gérer les Assignations
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rapports
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SousAdminDashboard;
