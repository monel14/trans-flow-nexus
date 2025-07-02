
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
  Activity,
  Shield,
  BarChart3,
  Globe
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
      label: 'Supervision Globale',
      icon: Globe,
      onClick: () => console.log('Supervision'),
      variant: 'default' as const
    },
    {
      label: 'Gestion Agences',
      icon: Building,
      onClick: () => navigate('/agencies'),
      variant: 'secondary' as const
    },
    {
      label: 'Validation Urgente',
      icon: CheckCircle,
      onClick: () => navigate('/validation'),
      variant: 'outline' as const
    },
    {
      label: 'Rapports Avancés',
      icon: BarChart3,
      onClick: () => console.log('Rapports'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête Admin */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Centre de Contrôle - Administrateur Général
        </h1>
        <p className="text-red-100">
          Supervision complète du système TransFlow Nexus - 15 agences actives
        </p>
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
          title="Opérations Système"
          value="347"
          icon={Activity}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
          subtitle="156 validées, 12 urgentes"
        />
        <MetricCard
          title="Réseau TransFlow"
          value="15 Agences"
          icon={Building}
          iconColor="text-purple-500"
          valueColor="text-purple-600"
          subtitle="89 agents, 12 chefs"
        />
        <MetricCard
          title="Revenus Système"
          value={formatAmount(450000)}
          icon={DollarSign}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          subtitle="Commissions ce mois"
        />
      </div>

      {/* Actions rapides */}
      <QuickActions actions={quickActions} title="Centre de Contrôle" />

      {/* Vue d'ensemble du système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Shield className="mr-2 h-5 w-5" />
              État du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-900">Système Principal</span>
                </div>
                <span className="text-green-600 text-sm font-semibold">Opérationnel</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-900">Base de Données</span>
                </div>
                <span className="text-green-600 text-sm font-semibold">99.8% Uptime</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-yellow-900">API Gateway</span>
                </div>
                <span className="text-yellow-600 text-sm font-semibold">Charge élevée</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-blue-900">Monitoring</span>
                </div>
                <span className="text-blue-600 text-sm font-semibold">Surveillance active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <BarChart3 className="mr-2 h-5 w-5" />
              Performance Réseau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Top 3 Agences (Volume)</span>
              </div>
              
              {['Agence Abidjan Centre', 'Agence Yamoussoukro', 'Agence San Pedro'].map((agence, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full mr-3">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{agence}</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {formatAmount(Math.floor(Math.random() * 500000) + 800000)}
                  </span>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Croissance réseau</p>
                  <p className="text-2xl font-bold text-green-600">+18.5%</p>
                  <p className="text-xs text-gray-500">vs mois dernier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files d'attente critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Files d'Attente Critiques - Intervention Requise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-900">
                  Transactions Bloquées
                </span>
                <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                  12
                </span>
              </div>
              <p className="text-xs text-red-700 mb-3">Nécessite validation immédiate</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/validation')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Traiter Maintenant
              </Button>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Requêtes Support Critiques
                </span>
                <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded-full">
                  7
                </span>
              </div>
              <p className="text-xs text-orange-700 mb-3">Incidents système signalés</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/support')}
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                Examiner
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-900">
                  Agences Sous-Performance
                </span>
                <span className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">
                  3
                </span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">Volume en baisse significative</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/agencies')}
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Analyser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGeneralDashboard;
