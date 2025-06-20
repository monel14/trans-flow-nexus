
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  DollarSign,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';

const AdminGeneralDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(amount) + ' XOF';
  };

  const quickActions = [
    {
      label: 'Validation Transactions',
      icon: CheckCircle,
      onClick: () => navigate('/validation'),
      variant: 'default' as const
    },
    {
      label: 'Gestion Agences',
      icon: Building,
      onClick: () => navigate('/agencies'),
      variant: 'secondary' as const
    },
    {
      label: 'Requêtes Support',
      icon: FileText,
      onClick: () => navigate('/support'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord - {user?.role === 'admin_general' ? 'Administrateur Général' : 'Sous-Administrateur'}
        </h1>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Volume Total (Aujourd'hui)"
          value={formatAmount(8750000)}
          icon={TrendingUp}
          iconColor="text-green-500"
          valueColor="text-green-600"
          subtitle="+12% vs hier"
        />
        <MetricCard
          title="Opérations (Aujourd'hui)"
          value="347"
          icon={Activity}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="156 validées, 12 en attente"
        />
        <MetricCard
          title="Agences Actives"
          value="15"
          icon={Building}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="89 agents total"
        />
        <MetricCard
          title="Revenus Commissions"
          value={formatAmount(450000)}
          icon={DollarSign}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          subtitle="Ce mois"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Actions Rapides" />

      {/* Files d'attente critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Files d'Attente Critiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-900">
                  Transactions en Attente
                </span>
                <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                  12
                </span>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/validation')}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Traiter
              </Button>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Requêtes Support
                </span>
                <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded-full">
                  7
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/support')}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Voir
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-900">
                  Recharges Chefs d'Agence
                </span>
                <span className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">
                  3
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/agencies')}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Gérer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des Agences</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique de performance des agences</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution du Volume</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique d'évolution du volume</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGeneralDashboard;
